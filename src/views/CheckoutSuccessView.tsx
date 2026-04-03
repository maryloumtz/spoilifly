"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/views/components/AppShell";
import { SectionTitle, StatusMessage } from "@/views/components/ui";

export default function CheckoutSuccessView() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-8">
        <SectionTitle
          eyebrow="Succès"
          title="Paiement confirmé"
          description="Les achats ont été enregistrés et les droits premium ont été appliqués côté serveur."
        />
        <div className="mt-8 space-y-4">
          <StatusMessage>Session confirmée: {sessionId ?? "indisponible"}</StatusMessage>
          <div className="flex flex-wrap gap-3">
            <Link href="/library" className="rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-200">
              Ouvrir la bibliothèque
            </Link>
            <Link href="/works" className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">
              Retour au catalogue
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
