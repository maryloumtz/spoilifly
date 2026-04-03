"use client";

import { useCatalogVM } from "@/viewmodels/useCatalogVM";
import { AppShell } from "@/views/components/AppShell";
import { WorkCard } from "@/views/components/WorkCard";
import { Field, SectionTitle, Select, StatusMessage, TextInput } from "@/views/components/ui";

export default function CatalogView() {
  const { data, isLoading, error, filters, setFilters } = useCatalogVM();

  return (
    <AppShell
      hero={
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <SectionTitle
              eyebrow="Catalogue"
              title="Parcours les oeuvres et choisis ton niveau de spoil"
              description="Filtres, tri, paywall premium et accès synchronisés après achat."
            />
          </div>
        </section>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="space-y-4">
            <Field label="Recherche">
              <TextInput value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="titre, intrigue..." />
            </Field>
            <Field label="Type">
              <Select value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as typeof current.type }))}>
                <option value="all">Tous</option>
                <option value="movie">Film</option>
                <option value="series">Série</option>
                <option value="book">Livre</option>
                <option value="anime">Anime</option>
                <option value="game">Jeu vidéo</option>
              </Select>
            </Field>
            <Field label="Catégorie">
              <Select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
                <option value="">Toutes</option>
                {data?.categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tag">
              <Select value={filters.tag} onChange={(event) => setFilters((current) => ({ ...current, tag: event.target.value }))}>
                <option value="">Tous</option>
                {data?.tags.map((tag) => (
                  <option key={tag.id} value={tag.slug}>
                    {tag.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Niveau de spoil">
              <Select value={filters.level} onChange={(event) => setFilters((current) => ({ ...current, level: event.target.value as typeof current.level }))}>
                <option value="all">Tous</option>
                <option value="light">Léger</option>
                <option value="major">Majeur</option>
                <option value="ending">Fin</option>
              </Select>
            </Field>
            <Field label="Tri">
              <Select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value as typeof current.sort }))}>
                <option value="popular">Popularité</option>
                <option value="recent">Plus récent</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="title">Titre</option>
              </Select>
            </Field>
          </div>
        </aside>

        <section className="space-y-6">
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          {isLoading ? <StatusMessage>Chargement du catalogue...</StatusMessage> : null}
          {!isLoading && data?.works.length === 0 ? <StatusMessage>Aucune oeuvre ne correspond à ces filtres.</StatusMessage> : null}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data?.works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
