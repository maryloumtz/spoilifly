"use client";

import Link from "next/link";
import type { SpoilerSummary } from "@/models/view";
import { formatPrice } from "@/services/formatters";
import { Chip } from "@/views/components/ui";

export function SpoilerCard({ spoiler }: { spoiler: SpoilerSummary }) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-slate-950/50 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Chip>{spoiler.level}</Chip>
        {spoiler.isOwned ? <Chip>Débloqué</Chip> : <Chip>{formatPrice(spoiler.priceCents)}</Chip>}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{spoiler.title}</h3>
      <p className="mt-2 text-sm text-slate-300">{spoiler.teaser}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {spoiler.tags.map((tag) => (
          <Chip key={tag.id}>#{tag.name}</Chip>
        ))}
      </div>
      <Link href={`/spoilers/${spoiler.id}`} className="mt-5 inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
        Voir le détail
      </Link>
    </article>
  );
}
