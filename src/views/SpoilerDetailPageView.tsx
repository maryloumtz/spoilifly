"use client";

import Image from "next/image";
import { useAppVM } from "@/viewmodels/useAppVM";
import { useSpoilerDetailVM } from "@/viewmodels/useSpoilerDetailVM";
import { AppShell } from "@/views/components/AppShell";
import { ButtonLink, Chip, PricePill, SectionTitle, StatusMessage } from "@/views/components/ui";

export default function SpoilerDetailPageView({ id }: { id: string }) {
  const { data, isLoading, error } = useSpoilerDetailVM(id);
  const { addToCart } = useAppVM();

  return (
    <AppShell>
      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      {isLoading ? <StatusMessage>Chargement du spoiler...</StatusMessage> : null}
      {data ? (
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Chip>{data.level}</Chip>
              {data.isOwned ? <Chip>Accès premium actif</Chip> : <PricePill priceCents={data.priceCents} />}
            </div>
            <SectionTitle eyebrow="Spoiler" title={data.title} description={`Oeuvre liée: ${data.work.title}`} />
            <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Teaser gratuit</p>
              <p className="mt-3 text-base leading-7 text-slate-100">{data.teaser}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Contenu premium</p>
              {data.premiumContent ? (
                <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-100">{data.premiumContent}</p>
              ) : (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-slate-300">
                    Le spoiler complet est protégé côté serveur. Achète ce spoiler ou le pack de l’oeuvre pour débloquer le contenu.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          id: `spoil:${data.id}`,
                          productType: "spoil",
                          productId: data.id,
                          title: data.title,
                          workTitle: data.work.title,
                          priceCents: data.priceCents,
                        })
                      }
                      className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200"
                    >
                      Ajouter ce spoiler
                    </button>
                    {data.pack && !data.pack.isOwned ? (
                      <button
                        type="button"
                        onClick={() =>
                          addToCart({
                            id: `pack:${data.pack!.id}`,
                            productType: "pack",
                            productId: data.pack!.id,
                            title: data.pack!.title,
                            workTitle: data.work.title,
                            priceCents: data.pack!.priceCents,
                          })
                        }
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                      >
                        Ajouter le pack
                      </button>
                    ) : null}
                    <ButtonLink href="/cart" variant="ghost">
                      Voir le panier
                    </ButtonLink>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="relative h-80 w-full overflow-hidden rounded-[32px]">
              <Image src={data.work.coverImage} alt={data.work.title} fill className="object-cover" sizes="(max-width: 1280px) 100vw, 32vw" />
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <SectionTitle eyebrow="Contexte" title={data.work.title} />
              <div className="mt-4 flex flex-wrap gap-2">
                {data.tags.map((tag) => (
                  <Chip key={tag.id}>#{tag.name}</Chip>
                ))}
              </div>
              <div className="mt-6 space-y-4">
                {data.media.map((media) => (
                  <div key={media.id} className="relative h-36 w-full overflow-hidden rounded-2xl">
                    <Image src={media.url} alt={media.alt} fill className="object-cover" sizes="(max-width: 1280px) 100vw, 32vw" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </AppShell>
  );
}
