"use client";

import { useProfileVM } from "@/viewmodels/useProfileVM";
import { formatPrice } from "@/services/formatters";
import { AppShell } from "@/views/components/AppShell";
import { Field, SectionTitle, StatusMessage, SubmitButton, TextArea, TextInput } from "@/views/components/ui";

export default function ProfileView() {
  const { form, setForm, purchases, isLoading, isSaving, error, success, fieldErrors, save } = useProfileVM();

  return (
    <AppShell>
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <SectionTitle eyebrow="Profil" title="Compte et sécurité" description="Modifie ton identité publique, ton avatar et tes paramètres de connexion." />
          {isLoading ? <div className="mt-6"><StatusMessage>Chargement du profil...</StatusMessage></div> : null}
          <form
            className="mt-8 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <Field label="Pseudo" error={fieldErrors.displayName}>
              <TextInput value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} />
            </Field>
            <Field label="Email" error={fieldErrors.email}>
              <TextInput type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            </Field>
            <Field label="Avatar URL" error={fieldErrors.avatarUrl}>
              <TextInput value={form.avatarUrl} onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))} placeholder="https://..." />
            </Field>
            <Field label="Bio" error={fieldErrors.bio}>
              <TextArea value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Mot de passe actuel" error={fieldErrors.currentPassword}>
                <TextInput type="password" value={form.currentPassword} onChange={(event) => setForm((current) => ({ ...current, currentPassword: event.target.value }))} />
              </Field>
              <Field label="Nouveau mot de passe" error={fieldErrors.newPassword}>
                <TextInput type="password" value={form.newPassword} onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))} />
              </Field>
            </div>
            {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
            {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}
            <SubmitButton disabled={isSaving}>{isSaving ? "Enregistrement..." : "Enregistrer le profil"}</SubmitButton>
          </form>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <SectionTitle eyebrow="Historique" title="Achats validés et en attente" />
          <div className="mt-6 space-y-4">
            {purchases.length === 0 ? <StatusMessage>Aucun achat pour le moment.</StatusMessage> : null}
            {purchases.map((purchase) => (
              <div key={purchase.id} className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{purchase.productTitle}</p>
                    <p className="text-sm text-slate-300">{purchase.workTitle}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                    {purchase.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                  <span>{new Date(purchase.createdAt).toLocaleString("fr-FR")}</span>
                  <span className="font-semibold text-amber-300">{formatPrice(purchase.amountCents)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
