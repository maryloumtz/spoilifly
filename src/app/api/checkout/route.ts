import { createCheckoutSession } from "@/services/server/checkout";
import { requireSessionUser } from "@/services/server/auth";
import { jsonError, jsonOk } from "@/services/server/http";

export async function POST(request: Request) {
  const auth = await requireSessionUser();
  if ("error" in auth) {
    return auth.error;
  }

  const body = (await request.json()) as {
    items?: Array<{ productType?: "spoil" | "pack"; productId?: string }>;
  };

  const items =
    body.items?.flatMap((item) =>
      item.productType && item.productId ? [{ productType: item.productType, productId: item.productId }] : [],
    ) ?? [];

  if (items.length === 0) {
    return jsonError("Le panier est vide.", 400);
  }

  const result = await createCheckoutSession(auth.user, items);

  if ("error" in result) {
    return jsonError(result.error as string, 400);
  }

  return jsonOk(result);
}
