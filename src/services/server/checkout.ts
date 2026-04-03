import { createHmac } from "node:crypto";
import type { CheckoutSession, Entitlement, Pack, Purchase, SessionUser, SpoilItem } from "@/models/domain";
import type { SimulatedPaymentInput } from "@/models/forms";
import { mutateDatabase, readDatabase } from "@/services/server/db";
import { createWalletEntry } from "@/services/server/community";
import { createId, getBaseUrl, nowIso } from "@/services/server/utils";
import { validateSimulatedPayment } from "@/services/server/validators";

export interface CheckoutItem {
  productType: "spoil" | "pack";
  productId: string;
}

function resolveItems(db: Awaited<ReturnType<typeof readDatabase>>, items: CheckoutItem[]) {
  return items.map((item) => {
    const spoiler = item.productType === "spoil" ? db.spoilers.find((entry) => entry.id === item.productId) : null;
    const pack = item.productType === "pack" ? db.packs.find((entry) => entry.id === item.productId) : null;
    const title = spoiler?.title ?? pack?.title;
    const amountCents = spoiler?.priceCents ?? pack?.priceCents;
    const workId = spoiler?.workId ?? pack?.workId;

    return {
      ...item,
      title,
      amountCents,
      workId,
      pack,
    };
  });
}

export async function createCheckoutSession(sessionUser: SessionUser, items: CheckoutItem[]) {
  const db = await readDatabase();
  const resolved = resolveItems(db, items);

  if (resolved.some((entry) => !entry.title || !entry.amountCents || !entry.workId)) {
    return { error: "Le panier contient un produit invalide." };
  }

  const amountCents = resolved.reduce((sum, entry) => sum + entry.amountCents!, 0);
  const sessionId = createId("checkout");
  const session: CheckoutSession = {
    id: sessionId,
    userId: sessionUser.id,
    itemIds: items.map((item) => `${item.productType}:${item.productId}`),
    amountCents,
    provider: "mock_stripe",
    status: "open",
    successUrl: `${getBaseUrl()}/checkout/success?session_id=${sessionId}`,
    cancelUrl: `${getBaseUrl()}/cart?cancelled=1`,
    createdAt: nowIso(),
    completedAt: null,
  };

  await mutateDatabase((draft) => {
    draft.checkoutSessions.push(session);
    resolved.forEach((entry) => {
      const purchase: Purchase = {
        id: createId("purchase"),
        userId: sessionUser.id,
        productType: entry.productType,
        productId: entry.productId,
        amountCents: entry.amountCents!,
        status: "pending",
        checkoutSessionId: sessionId,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      draft.purchases.push(purchase);
    });
  });

  return {
    sessionId,
    checkoutUrl: `/checkout/simulated-stripe?session_id=${sessionId}`,
  };
}

function entitlementExists(entitlements: Entitlement[], userId: string, spoilId: string | null, packId: string | null): boolean {
  return entitlements.some(
    (entry) => entry.userId === userId && entry.spoilId === spoilId && entry.packId === packId,
  );
}

function grantPackEntitlements(
  entitlements: Entitlement[],
  purchases: Purchase[],
  userId: string,
  purchase: Purchase,
  pack: Pack,
  spoilers: SpoilItem[],
) {
  if (!entitlementExists(entitlements, userId, null, pack.id)) {
    entitlements.push({
      id: createId("entitlement"),
      userId,
      workId: pack.workId,
      spoilId: null,
      packId: pack.id,
      sourcePurchaseId: purchase.id,
      createdAt: nowIso(),
    });
  }

  spoilers
    .filter((entry) => pack.spoilIds.includes(entry.id))
    .forEach((spoil) => {
      if (!entitlementExists(entitlements, userId, spoil.id, pack.id)) {
        entitlements.push({
          id: createId("entitlement"),
          userId,
          workId: pack.workId,
          spoilId: spoil.id,
          packId: pack.id,
          sourcePurchaseId: purchase.id,
          createdAt: new Date().toISOString(),
        });
      }
    });

  purchase.status = "paid";
  purchase.updatedAt = nowIso();
}

function rewardSpoilerCreator(
  db: Awaited<ReturnType<typeof readDatabase>>,
  spoiler: SpoilItem,
  amountCents: number,
  sourceType: "spoil" | "pack",
  sourceId: string,
) {
  const creatorShare = Math.round(amountCents * 0.7);
  createWalletEntry(db.walletEntries, {
    userId: spoiler.creatorUserId,
    amountCents: creatorShare,
    type: "sale",
    sourceType,
    sourceId,
    description: `Vente du spoil "${spoiler.title}"`,
  });
}

export async function confirmCheckoutSession(sessionId: string, userId: string) {
  return mutateDatabase((db) => {
    const session = db.checkoutSessions.find((entry) => entry.id === sessionId && entry.userId === userId);
    if (!session) {
      return { error: "Session de paiement introuvable." };
    }

    if (session.status === "completed") {
      return { ok: true, session };
    }

    const relatedPurchases = db.purchases.filter(
      (entry) => entry.checkoutSessionId === sessionId && entry.userId === userId,
    );

    relatedPurchases.forEach((purchase) => {
      if (purchase.productType === "spoil") {
        const spoiler = db.spoilers.find((entry) => entry.id === purchase.productId);
        if (!spoiler) {
          purchase.status = "failed";
          return;
        }

        if (!entitlementExists(db.entitlements, userId, spoiler.id, null)) {
          db.entitlements.push({
            id: createId("entitlement"),
            userId,
            workId: spoiler.workId,
            spoilId: spoiler.id,
            packId: null,
            sourcePurchaseId: purchase.id,
            createdAt: nowIso(),
          });
        }

        purchase.status = "paid";
        purchase.updatedAt = nowIso();
        rewardSpoilerCreator(db, spoiler, purchase.amountCents, "spoil", spoiler.id);
        return;
      }

      const pack = db.packs.find((entry) => entry.id === purchase.productId);
      if (!pack) {
        purchase.status = "failed";
        return;
      }

      grantPackEntitlements(db.entitlements, db.purchases, userId, purchase, pack, db.spoilers);
      const packSpoilers = db.spoilers.filter((entry) => pack.spoilIds.includes(entry.id));
      const creatorSharePerSpoiler = packSpoilers.length > 0 ? Math.round((purchase.amountCents * 0.7) / packSpoilers.length) : 0;
      packSpoilers.forEach((spoiler) => {
        createWalletEntry(db.walletEntries, {
          userId: spoiler.creatorUserId,
          amountCents: creatorSharePerSpoiler,
          type: "sale",
          sourceType: "pack",
          sourceId: pack.id,
          description: `Part créateur sur le pack "${pack.title}"`,
        });
      });
    });

    session.status = "completed";
    session.completedAt = nowIso();
    return { ok: true, session };
  });
}

export async function processSimulatedStripePayment(user: SessionUser, input: SimulatedPaymentInput) {
  const validation = validateSimulatedPayment(input);
  if (validation.errors) {
    return { error: validation.errors };
  }

  const db = await readDatabase();
  const session = db.checkoutSessions.find((entry) => entry.id === validation.data!.sessionId && entry.userId === user.id);
  if (!session) {
    return { error: { sessionId: "Session introuvable." } };
  }

  const signature = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET || "spoilifly-webhook-secret")
    .update(JSON.stringify({ type: "checkout.session.completed", data: { sessionId: session.id, userId: user.id } }))
    .digest("hex");

  const result = await confirmCheckoutSession(session.id, user.id);
  if ("error" in result) {
    return { error: { sessionId: result.error } };
  }

  return {
    ok: true,
    sessionId: session.id,
    signature,
  };
}
