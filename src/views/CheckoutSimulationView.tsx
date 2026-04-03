"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAppVM } from "@/viewmodels/useAppVM";
import { useCheckoutVM } from "@/viewmodels/useCheckoutVM";
import { AppShell } from "@/views/components/AppShell";
import { Field, SectionTitle, StatusMessage, SubmitButton, TextInput } from "@/views/components/ui";

export default function CheckoutSimulationView() {
  const params = useSearchParams();
  const sessionId = params.get("session_id") ?? "";
  const { sessionUser } = useAppVM();
  const { completeCheckout, isPaying, error } = useCheckoutVM();
  const [payment, setPayment] = useState({
    cardholderName: sessionUser?.displayName ?? "",
    cardNumber: "4242 4242 4242 4242",
    expiry: "12/30",
    cvc: "123",
    billingEmail: sessionUser?.email ?? "",
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-8">
        <SectionTitle
          eyebrow="Mock Stripe"
          title="Simulation de Checkout"
          description="Ce flux remplace Stripe en local, mais conserve la structure session -> confirmation -> entitlements -> bibliothèque."
        />
        <div className="mt-8 space-y-4">
          <StatusMessage>Session: {sessionId || "indisponible"}</StatusMessage>
          <StatusMessage>Carte de test attendue: `4242 4242 4242 4242`.</StatusMessage>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await completeCheckout({ sessionId, ...payment });
              window.location.href = `/checkout/success?session_id=${sessionId}`;
            }}
          >
            <Field label="Titulaire">
              <TextInput value={payment.cardholderName} onChange={(event) => setPayment((current) => ({ ...current, cardholderName: event.target.value }))} />
            </Field>
            <Field label="Numéro de carte">
              <TextInput value={payment.cardNumber} onChange={(event) => setPayment((current) => ({ ...current, cardNumber: event.target.value }))} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Expiration">
                <TextInput value={payment.expiry} onChange={(event) => setPayment((current) => ({ ...current, expiry: event.target.value }))} />
              </Field>
              <Field label="CVC">
                <TextInput value={payment.cvc} onChange={(event) => setPayment((current) => ({ ...current, cvc: event.target.value }))} />
              </Field>
            </div>
            <Field label="Email de facturation">
              <TextInput type="email" value={payment.billingEmail} onChange={(event) => setPayment((current) => ({ ...current, billingEmail: event.target.value }))} />
            </Field>
            <div className="flex flex-wrap gap-3">
              <SubmitButton disabled={!sessionId || isPaying}>{isPaying ? "Traitement..." : "Payer maintenant"}</SubmitButton>
              <Link href="/cart" className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">
                Retour panier
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
