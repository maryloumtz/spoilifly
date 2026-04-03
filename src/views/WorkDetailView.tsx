"use client";

import Image from "next/image";
import { useAppVM } from "@/viewmodels/useAppVM";
import { useWorkDetailVM } from "@/viewmodels/useWorkDetailVM";
import { AppShell } from "@/views/components/AppShell";
import { SpoilerCard } from "@/views/components/SpoilerCard";
import { ButtonLink, Chip, PricePill, SectionTitle, StatusMessage } from "@/views/components/ui";

export default function WorkDetailView({ slug }: { slug: string }) {
  const { data, isLoading, error } = useWorkDetailVM(slug);
  const { addToCart } = useAppVM();

  return (
    <AppShell>
      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      {isLoading ? <StatusMessage>Chargement de l&apos;oeuvre...</StatusMessage> : null}
      {data ? (
        <div className="space-y-10">
          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-80 overflow-hidden rounded-[32px]">
              <Image src={data.coverImage} alt={data.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 52vw" />
            </div>
            <div className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap gap-2">
                <Chip>{data.type}</Chip>
                {data.category ? <Chip>{data.category.name}</Chip> : null}
                <Chip>{data.releaseYear}</Chip>
              </div>
              <SectionTitle title={data.title} description={data.description} eyebrow="Oeuvre" />
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag) => (
                  <Chip key={tag.id}>#{tag.name}</Chip>
                ))}
              </div>
              {data.pack ? (
                <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{data.pack.title}</p>
                      <p className="mt-1 text-sm text-slate-300">{data.pack.description}</p>
                    </div>
                    <PricePill priceCents={data.pack.priceCents} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {data.pack.isOwned ? (
                      <Chip>Pack débloqué</Chip>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          addToCart({
                            id: `pack:${data.pack!.id}`,
                            productType: "pack",
                            productId: data.pack!.id,
                            title: data.pack!.title,
                            workTitle: data.title,
                            priceCents: data.pack!.priceCents,
                          })
                        }
                        className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200"
                      >
                        Ajouter le pack
                      </button>
                    )}
                    <ButtonLink href="/cart" variant="ghost">
                      Voir le panier
                    </ButtonLink>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="grid gap-8 xl:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <SectionTitle
                eyebrow="Spoilers"
                title={`${data.spoilers.length} révélations disponibles`}
                description="Chaque spoiler garde un teaser gratuit. Le contenu complet reste verrouillé tant qu’aucun entitlement valide n’existe côté serveur."
              />
              <div className="grid gap-4 lg:grid-cols-2">
                {data.spoilers.map((spoiler) => (
                  <div key={spoiler.id} className="space-y-3">
                    <SpoilerCard spoiler={spoiler} />
                    {!spoiler.isOwned ? (
                      <button
                        type="button"
                        onClick={() =>
                          addToCart({
                            id: `spoil:${spoiler.id}`,
                            productType: "spoil",
                            productId: spoiler.id,
                            title: spoiler.title,
                            workTitle: data.title,
                            priceCents: spoiler.priceCents,
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
                      >
                        Ajouter au panier
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <SectionTitle eyebrow="Carte" title={data.spoilZoneLabel} description="Zone de spoil emblématique liée à l’oeuvre." />
              <div className="relative mt-6 aspect-square overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(160deg,_rgba(251,191,36,0.15),_rgba(15,23,42,0.95))]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.18),_transparent_30%),radial-gradient(circle_at_70%_80%,_rgba(251,191,36,0.16),_transparent_26%)]" />
                <div
                  className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-amber-300 bg-white shadow-[0_0_0_10px_rgba(251,191,36,0.14)]"
                  style={{ left: `${data.spoilZoneX}%`, top: `${data.spoilZoneY}%` }}
                />
              </div>
            </aside>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
