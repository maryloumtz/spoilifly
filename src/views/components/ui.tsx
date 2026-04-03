"use client";

import Link from "next/link";
import { formatPrice } from "@/services/formatters";

export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300">{eyebrow}</p> : null}
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
      {description ? <p className="max-w-2xl text-sm text-slate-300 sm:text-base">{description}</p> : null}
    </div>
  );
}

export function StatusMessage({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "error" | "success";
  children: React.ReactNode;
}) {
  const classes =
    tone === "error"
      ? "border-red-500/40 bg-red-500/10 text-red-100"
      : tone === "success"
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
        : "border-white/10 bg-white/5 text-slate-200";

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${classes}`}>{children}</div>;
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
      {children}
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  const classes =
    variant === "primary"
      ? "bg-amber-300 text-slate-950 hover:bg-amber-200"
      : "border border-white/10 bg-white/5 text-white hover:bg-white/10";

  return (
    <Link href={href} className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ${classes}`}>
      {children}
    </Link>
  );
}

export function PricePill({ priceCents }: { priceCents: number }) {
  return (
    <span className="inline-flex rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-slate-950">
      {formatPrice(priceCents)}
    </span>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="font-medium text-slate-200">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300 ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-32 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300 ${props.className ?? ""}`}
    />
  );
}

export function SubmitButton({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex items-center justify-center rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}
