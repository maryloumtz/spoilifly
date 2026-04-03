"use client";

import { useCheckoutVM } from "@/viewmodels/useCheckoutVM";
import { useAppVM } from "@/viewmodels/useAppVM";
import { formatPrice } from "@/services/formatters";
import { AppShell } from "@/views/components/AppShell";
import { ButtonLink, SectionTitle, StatusMessage } from "@/views/components/ui";

export default function CartView() {
  const { cart, cartTotalCents, removeFromCart } = useAppVM();
  const { startCheckout, isSubmitting, error } = useCheckoutVM();

  return (
    <AppShell>
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <SectionTitle eyebrow="Panier" title="Prépare ton checkout" description="Les articles premium sont conservés localement jusqu’à confirmation du paiement." />
          <div className="mt-8 space-y-4">
            {cart.length === 0 ? <StatusMessage>Ton panier est vide.</StatusMessage> : null}
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-slate-300">{item.workTitle}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-amber-300">{formatPrice(item.priceCents)}</span>
                  <button type="button" onClick={() => removeFromCart(item.id)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10">
                    Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <SectionTitle eyebrow="Paiement" title="Résumé Stripe" description="Implémentation mockée localement avec session de checkout, page de succès, webhook signé et création des entitlements." />
          <div className="mt-8 space-y-4 rounded-[24px] border border-white/10 bg-slate-950/50 p-5">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Total</span>
              <span className="text-lg font-semibold text-white">{formatPrice(cartTotalCents)}</span>
            </div>
            {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
            <button
              type="button"
              disabled={cart.length === 0 || isSubmitting}
              onClick={() => void startCheckout()}
              className="w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Redirection..." : "Créer la session Checkout"}
            </button>
            <ButtonLink href="/works" variant="ghost">
              Continuer mes achats
            </ButtonLink>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
