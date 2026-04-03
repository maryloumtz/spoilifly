"use client";

import { useCatalogVM } from "@/viewmodels/useCatalogVM";
import { useCreatorVM } from "@/viewmodels/useCreatorVM";
import { formatPrice, formatPriceInput, parseEuroInput } from "@/services/formatters";
import { AppShell } from "@/views/components/AppShell";
import { Field, SectionTitle, Select, StatusMessage, SubmitButton, TextArea, TextInput } from "@/views/components/ui";

export default function CreatorView() {
  const { data: catalog } = useCatalogVM();
  const { data, form, setForm, isLoading, isSubmitting, error, fieldErrors, success, submit } = useCreatorVM();

  return (
    <AppShell>
      <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <SectionTitle eyebrow="Créateur" title="Publier un spoil monétisable" description="Les utilisateurs peuvent proposer des spoils, les vendre et les rendre visibles immédiatement dans le catalogue." />
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <Field label="Oeuvre" error={fieldErrors.workId}>
              <Select value={form.workId} onChange={(event) => setForm((current) => ({ ...current, workId: event.target.value, workTitle: "" }))}>
                <option value="">Choisir</option>
                {catalog?.works.map((work) => (
                  <option key={work.id} value={work.id}>
                    {work.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Ou nouveau titre" error={fieldErrors.workTitle}>
              <TextInput
                value={form.workTitle ?? ""}
                placeholder="Ex: Severance"
                onChange={(event) => setForm((current) => ({ ...current, workTitle: event.target.value, workId: "" }))}
              />
            </Field>
            <Field label="Titre" error={fieldErrors.title}>
              <TextInput value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </Field>
            <Field label="Teaser gratuit" error={fieldErrors.teaser}>
              <TextArea value={form.teaser} onChange={(event) => setForm((current) => ({ ...current, teaser: event.target.value }))} />
            </Field>
            <Field label="Contenu premium" error={fieldErrors.premiumContent}>
              <TextArea value={form.premiumContent} onChange={(event) => setForm((current) => ({ ...current, premiumContent: event.target.value }))} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Niveau" error={fieldErrors.level}>
                <Select value={form.level} onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))}>
                  <option value="light">Léger</option>
                  <option value="major">Majeur</option>
                  <option value="ending">Fin</option>
                </Select>
              </Field>
              <Field label="Prix (EUR)" error={fieldErrors.priceCents}>
                <TextInput
                  type="number"
                  min="0.99"
                  step="0.01"
                  value={formatPriceInput(form.priceCents)}
                  onChange={(event) => setForm((current) => ({ ...current, priceCents: parseEuroInput(event.target.value) }))}
                />
              </Field>
            </div>
            <Field label="Tags (ids)" error={fieldErrors.tagIds}>
              <TextInput value={form.tagIds.join(",")} onChange={(event) => setForm((current) => ({ ...current, tagIds: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) }))} />
            </Field>
            {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
            {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}
            <SubmitButton disabled={isSubmitting}>{isSubmitting ? "Publication..." : "Publier le spoil"}</SubmitButton>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <SectionTitle eyebrow="Revenus" title="Monétisation des spoils" />
            {isLoading ? <div className="mt-6"><StatusMessage>Chargement de l&apos;espace créateur...</StatusMessage></div> : null}
            {data ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-5">
                  <p className="text-sm text-slate-300">Solde disponible</p>
                  <p className="mt-2 text-3xl font-semibold text-amber-300">{formatPrice(data.availableBalanceCents)}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-5">
                  <p className="text-sm text-slate-300">Spoils publiés</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{data.spoilers.length}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <SectionTitle title="Mes spoils" />
            <div className="mt-6 space-y-3">
              {data?.spoilers.map((spoiler) => (
                <div key={spoiler.id} className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{spoiler.title}</p>
                      <p className="text-sm text-slate-300">{spoiler.workTitle}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200">{spoiler.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{spoiler.teaser}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
