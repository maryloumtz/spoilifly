"use client";

import Image from "next/image";
import Link from "next/link";
import type { WorkCardView } from "@/models/view";
import { formatPrice } from "@/services/formatters";
import { Chip } from "@/views/components/ui";

export function WorkCard({ work }: { work: WorkCardView }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
      <div className="relative h-52 w-full">
        <Image src={work.coverImage} alt={work.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Chip>{work.type}</Chip>
          {work.category ? <Chip>{work.category.name}</Chip> : null}
          <Chip>{work.releaseYear}</Chip>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">{work.title}</h3>
          <p className="mt-2 line-clamp-3 text-sm text-slate-300">{work.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {work.tags.slice(0, 3).map((tag) => (
            <Chip key={tag.id}>#{tag.name}</Chip>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-slate-300">
            <div>{work.spoilerCount} spoilers</div>
            <div className="font-semibold text-amber-300">Dès {formatPrice(work.lowestPriceCents)}</div>
          </div>
          <Link href={`/works/${work.slug}`} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
            Explorer
          </Link>
        </div>
      </div>
    </article>
  );
}
