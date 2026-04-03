"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/services/formatters";
import { useHomeVM } from "@/viewmodels/useHomeVM";
import { AppShell } from "@/views/components/AppShell";
import { WorkCard } from "@/views/components/WorkCard";
import { ButtonLink, Chip, SectionTitle, StatusMessage } from "@/views/components/ui";

export default function HomeView() {
  const { data, isLoading, error } = useHomeVM();
  const featured = data?.featured ?? [];
  const latest = data?.latest ?? [];
  const latestSpoilers = data?.latestSpoilers ?? [];

  return (
    <AppShell
      hero={
        <section className="border-b border-white/10">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300">Spoilers premium</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Teasers gratuits, révélations premium et bibliothèque sécurisée.
              </h1>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/works">Explorer le catalogue</ButtonLink>
                <ButtonLink href="/library" variant="ghost">
                  Ouvrir ma bibliothèque
                </ButtonLink>
              </div>
            </div>

            <div className="grid gap-4 rounded-[36px] border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
              {featured.slice(0, 2).map((work) => (
                <div key={work.id} className="rounded-[28px] border border-white/10 bg-slate-950/60 p-4">
                  <div className="relative h-40 w-full overflow-hidden rounded-[20px]">
                    <Image src={work.coverImage} alt={work.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-white">{work.title}</p>
                  <p className="mt-2 text-sm text-slate-300">{work.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      }
    >
      <div className="space-y-12">
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {isLoading ? <StatusMessage>Chargement de l&apos;accueil...</StatusMessage> : null}

        <section className="space-y-6">
          <SectionTitle eyebrow="En vedette" title="Oeuvres qui cristallisent les plus gros spoilers" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <SectionTitle eyebrow="Récentes" title="Nouveaux contenus à débloquer" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {latest.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <SectionTitle eyebrow="Nouveautés" title="Derniers spoils publiés" description="Les révélations premium fraîchement ajoutées arrivent ici en priorité." />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {latestSpoilers.map((spoiler) => (
              <article key={spoiler.id} className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
                <div className="relative h-40 w-full">
                  <Image src={spoiler.work.coverImage} alt={spoiler.work.title} fill className="object-cover" sizes="(max-width: 1280px) 50vw, 25vw" />
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip>{spoiler.level}</Chip>
                    <Chip>{spoiler.isOwned ? "Débloqué" : formatPrice(spoiler.priceCents)}</Chip>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">{spoiler.work.title}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{spoiler.title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{spoiler.teaser}</p>
                  </div>
                  <Link href={`/spoilers/${spoiler.id}`} className="inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
                    Voir le spoil
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
