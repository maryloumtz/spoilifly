"use client";

import { useMemo, useState } from "react";
import type { PackInput, SpoilerInput, WorkInput } from "@/models/forms";
import { formatPriceInput, parseEuroInput } from "@/services/formatters";
import { useAdminVM } from "@/viewmodels/useAdminVM";
import { AppShell } from "@/views/components/AppShell";
import { Field, SectionTitle, Select, StatusMessage, SubmitButton, TextArea, TextInput } from "@/views/components/ui";

function emptyWork(): WorkInput {
  return {
    slug: "",
    title: "",
    description: "",
    type: "movie",
    categoryId: "",
    tagIds: [],
    coverImage: "",
    releaseYear: new Date().getFullYear(),
    spoilZoneLabel: "",
    spoilZoneX: 50,
    spoilZoneY: 50,
  };
}

function emptySpoiler(): SpoilerInput {
  return {
    workId: "",
    title: "",
    teaser: "",
    premiumContent: "",
    level: "major",
    tagIds: [],
    mediaIds: [],
    priceCents: 490,
  };
}

function emptyPack(): PackInput {
  return {
    workId: "",
    title: "",
    description: "",
    spoilIds: [],
    priceCents: 990,
  };
}

export default function AdminView() {
  const { data, isLoading, error, message, saveWork, removeWork, saveSpoiler, removeSpoiler, savePack, removePack, uploadMedia } = useAdminVM();
  const [workForm, setWorkForm] = useState<WorkInput>(emptyWork());
  const [spoilerForm, setSpoilerForm] = useState<SpoilerInput>(emptySpoiler());
  const [packForm, setPackForm] = useState<PackInput>(emptyPack());
  const [uploadState, setUploadState] = useState({ ownerType: "work", ownerId: "", alt: "", file: null as File | null });

  const workOptions = data?.works ?? [];
  const tagOptions = data?.tags ?? [];
  const categoryOptions = data?.categories ?? [];

  const availableSpoilers = useMemo(
    () => (data?.spoilers ?? []).filter((entry) => !packForm.workId || entry.workId === packForm.workId),
    [data?.spoilers, packForm.workId],
  );

  return (
    <AppShell>
      <SectionTitle eyebrow="Admin" title="CRUD catalogue et médias" description="Routes protégées côté serveur, upload local mocké, formulaires découplés des pages." />
      <div className="mt-8 space-y-5">
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {message ? <StatusMessage tone="success">{message}</StatusMessage> : null}
        {isLoading ? <StatusMessage>Chargement des références admin...</StatusMessage> : null}
      </div>

      {!isLoading && data ? (
        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <SectionTitle title="Créer une oeuvre" />
            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void saveWork(null, workForm);
                setWorkForm(emptyWork());
              }}
            >
              <Field label="Titre"><TextInput value={workForm.title} onChange={(event) => setWorkForm((current) => ({ ...current, title: event.target.value }))} /></Field>
              <Field label="Slug"><TextInput value={workForm.slug} onChange={(event) => setWorkForm((current) => ({ ...current, slug: event.target.value }))} /></Field>
              <Field label="Description"><TextArea value={workForm.description} onChange={(event) => setWorkForm((current) => ({ ...current, description: event.target.value }))} /></Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Type">
                  <Select value={workForm.type} onChange={(event) => setWorkForm((current) => ({ ...current, type: event.target.value }))}>
                    <option value="movie">Film</option>
                    <option value="series">Série</option>
                    <option value="book">Livre</option>
                    <option value="anime">Anime</option>
                    <option value="game">Jeu vidéo</option>
                  </Select>
                </Field>
                <Field label="Catégorie">
                  <Select value={workForm.categoryId} onChange={(event) => setWorkForm((current) => ({ ...current, categoryId: event.target.value }))}>
                    <option value="">Choisir</option>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Image de couverture"><TextInput value={workForm.coverImage} onChange={(event) => setWorkForm((current) => ({ ...current, coverImage: event.target.value }))} /></Field>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Année"><TextInput type="number" value={workForm.releaseYear} onChange={(event) => setWorkForm((current) => ({ ...current, releaseYear: Number(event.target.value) }))} /></Field>
                <Field label="Zone"><TextInput value={workForm.spoilZoneLabel} onChange={(event) => setWorkForm((current) => ({ ...current, spoilZoneLabel: event.target.value }))} /></Field>
                <Field label="Tags (ids, séparés par virgule)"><TextInput value={workForm.tagIds.join(",")} onChange={(event) => setWorkForm((current) => ({ ...current, tagIds: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) }))} /></Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Carte X %"><TextInput type="number" value={workForm.spoilZoneX} onChange={(event) => setWorkForm((current) => ({ ...current, spoilZoneX: Number(event.target.value) }))} /></Field>
                <Field label="Carte Y %"><TextInput type="number" value={workForm.spoilZoneY} onChange={(event) => setWorkForm((current) => ({ ...current, spoilZoneY: Number(event.target.value) }))} /></Field>
              </div>
              <SubmitButton>Enregistrer l&apos;oeuvre</SubmitButton>
            </form>

            <div className="mt-8 space-y-3">
              {data.works.map((work) => (
                <div key={work.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div>
                    <p className="font-semibold text-white">{work.title}</p>
                    <p className="text-xs text-slate-400">{work.slug}</p>
                  </div>
                  <button type="button" onClick={() => void removeWork(work.id)} className="rounded-xl border border-red-400/40 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10">
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <SectionTitle title="Créer un spoiler" />
              <form
                className="mt-6 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveSpoiler(null, spoilerForm);
                  setSpoilerForm(emptySpoiler());
                }}
              >
                <Field label="Oeuvre">
                  <Select value={spoilerForm.workId} onChange={(event) => setSpoilerForm((current) => ({ ...current, workId: event.target.value }))}>
                    <option value="">Choisir</option>
                    {workOptions.map((work) => (
                      <option key={work.id} value={work.id}>{work.title}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Titre"><TextInput value={spoilerForm.title} onChange={(event) => setSpoilerForm((current) => ({ ...current, title: event.target.value }))} /></Field>
                <Field label="Teaser"><TextArea value={spoilerForm.teaser} onChange={(event) => setSpoilerForm((current) => ({ ...current, teaser: event.target.value }))} /></Field>
                <Field label="Contenu premium"><TextArea value={spoilerForm.premiumContent} onChange={(event) => setSpoilerForm((current) => ({ ...current, premiumContent: event.target.value }))} /></Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Niveau">
                    <Select value={spoilerForm.level} onChange={(event) => setSpoilerForm((current) => ({ ...current, level: event.target.value }))}>
                      <option value="light">Léger</option>
                      <option value="major">Majeur</option>
                      <option value="ending">Fin</option>
                    </Select>
                  </Field>
                  <Field label="Prix (EUR)">
                    <TextInput
                      type="number"
                      min="0.99"
                      step="0.01"
                      value={formatPriceInput(spoilerForm.priceCents)}
                      onChange={(event) => setSpoilerForm((current) => ({ ...current, priceCents: parseEuroInput(event.target.value) }))}
                    />
                  </Field>
                </div>
                <Field label="Tags (ids)">
                  <TextInput value={spoilerForm.tagIds.join(",")} onChange={(event) => setSpoilerForm((current) => ({ ...current, tagIds: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) }))} placeholder={tagOptions.map((tag) => tag.id).join(", ")} />
                </Field>
                <SubmitButton>Enregistrer le spoiler</SubmitButton>
              </form>

              <div className="mt-8 space-y-3">
                {data.spoilers.map((spoiler) => (
                  <div key={spoiler.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div>
                      <p className="font-semibold text-white">{spoiler.title}</p>
                      <p className="text-xs text-slate-400">{spoiler.workId}</p>
                    </div>
                    <button type="button" onClick={() => void removeSpoiler(spoiler.id)} className="rounded-xl border border-red-400/40 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10">
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <SectionTitle title="Créer un pack" />
              <form
                className="mt-6 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void savePack(null, packForm);
                  setPackForm(emptyPack());
                }}
              >
                <Field label="Oeuvre">
                  <Select value={packForm.workId} onChange={(event) => setPackForm((current) => ({ ...current, workId: event.target.value }))}>
                    <option value="">Choisir</option>
                    {workOptions.map((work) => (
                      <option key={work.id} value={work.id}>{work.title}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Titre"><TextInput value={packForm.title} onChange={(event) => setPackForm((current) => ({ ...current, title: event.target.value }))} /></Field>
                <Field label="Description"><TextArea value={packForm.description} onChange={(event) => setPackForm((current) => ({ ...current, description: event.target.value }))} /></Field>
                <Field label="Spoilers inclus (ids)">
                  <TextInput value={packForm.spoilIds.join(",")} onChange={(event) => setPackForm((current) => ({ ...current, spoilIds: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) }))} placeholder={availableSpoilers.map((spoil) => spoil.id).join(", ")} />
                </Field>
                <Field label="Prix (EUR)">
                  <TextInput
                    type="number"
                    min="0.99"
                    step="0.01"
                    value={formatPriceInput(packForm.priceCents)}
                    onChange={(event) => setPackForm((current) => ({ ...current, priceCents: parseEuroInput(event.target.value) }))}
                  />
                </Field>
                <SubmitButton>Enregistrer le pack</SubmitButton>
              </form>

              <div className="mt-8 space-y-3">
                {data.packs.map((pack) => (
                  <div key={pack.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div>
                      <p className="font-semibold text-white">{pack.title}</p>
                      <p className="text-xs text-slate-400">{pack.spoilIds.length} spoilers</p>
                    </div>
                    <button type="button" onClick={() => void removePack(pack.id)} className="rounded-xl border border-red-400/40 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10">
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <SectionTitle title="Upload média" description="Stockage local dans public/uploads avec rattachement à une oeuvre ou un spoiler." />
              <form
                className="mt-6 space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!uploadState.file) {
                    return;
                  }
                  const formData = new FormData();
                  formData.set("ownerType", uploadState.ownerType);
                  formData.set("ownerId", uploadState.ownerId);
                  formData.set("alt", uploadState.alt);
                  formData.set("file", uploadState.file);
                  await uploadMedia(formData);
                  setUploadState({ ownerType: "work", ownerId: "", alt: "", file: null });
                }}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Type propriétaire">
                    <Select value={uploadState.ownerType} onChange={(event) => setUploadState((current) => ({ ...current, ownerType: event.target.value }))}>
                      <option value="work">Oeuvre</option>
                      <option value="spoil">Spoiler</option>
                    </Select>
                  </Field>
                  <Field label="ID propriétaire">
                    <TextInput value={uploadState.ownerId} onChange={(event) => setUploadState((current) => ({ ...current, ownerId: event.target.value }))} />
                  </Field>
                </div>
                <Field label="Texte alternatif">
                  <TextInput value={uploadState.alt} onChange={(event) => setUploadState((current) => ({ ...current, alt: event.target.value }))} />
                </Field>
                <Field label="Fichier">
                  <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4" onChange={(event) => setUploadState((current) => ({ ...current, file: event.target.files?.[0] ?? null }))} className="w-full text-sm text-slate-200" />
                </Field>
                <SubmitButton>Uploader</SubmitButton>
              </form>

              <div className="mt-8 space-y-3">
                {data.media.map((media) => (
                  <div key={media.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <p className="font-semibold text-white">{media.alt || media.id}</p>
                    <p className="text-xs text-slate-400">{media.url}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
