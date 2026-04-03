"use client";

import Image from "next/image";
import Link from "next/link";
import { useLibraryVM } from "@/viewmodels/useLibraryVM";
import { AppShell } from "@/views/components/AppShell";
import { Chip, SectionTitle, StatusMessage } from "@/views/components/ui";

export default function LibraryView() {
  const { entries, isLoading, error } = useLibraryVM();

  return (
    <AppShell>
      <SectionTitle eyebrow="Bibliothèque" title="Tes spoilers débloqués et créés" description="Les achats apparaissent ici automatiquement, et tes spoils nouvellement publiés ou en attente y sont aussi visibles." />
      <div className="mt-8 space-y-5">
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {isLoading ? <StatusMessage>Chargement de la bibliothèque...</StatusMessage> : null}
        {!isLoading && entries.length === 0 ? <StatusMessage>Aucun contenu premium débloqué pour le moment.</StatusMessage> : null}
        {entries.map((entry) => (
          <article key={entry.work.id} className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="relative h-52 w-full overflow-hidden rounded-[24px] lg:w-64">
                <Image src={entry.work.coverImage} alt={entry.work.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 256px" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Oeuvre</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{entry.work.title}</h2>
                  <p className="mt-2 text-sm text-slate-300">{entry.work.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.work.tags.map((tag) => (
                    <Chip key={tag.id}>#{tag.name}</Chip>
                  ))}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {entry.spoilers.map((spoiler) => (
                    <Link key={spoiler.id} href={`/spoilers/${spoiler.id}`} className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4 hover:border-amber-300/40">
                      <p className="font-semibold text-white">{spoiler.title}</p>
                      <p className="mt-2 text-sm text-slate-300">{spoiler.teaser}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
