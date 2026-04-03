"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAppVM } from "@/viewmodels/useAppVM";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-2 text-sm transition ${active ? "bg-white text-slate-950" : "text-slate-200 hover:bg-white/10"}`}
    >
      {label}
    </Link>
  );
}

export function AppShell({
  children,
  hero,
}: {
  children: React.ReactNode;
  hero?: React.ReactNode;
}) {
  const router = useRouter();
  const { sessionUser, cartCount, logoutUser } = useAppVM();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logoutUser();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.14),_transparent_35%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300 text-lg font-bold text-slate-950">S</span>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">SpoilyFly</div>
              <div className="text-xs text-slate-400">Premium spoiler platform</div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 sm:hidden"
          >
            Menu
          </button>

          <nav className="hidden items-center gap-2 sm:flex">
            <NavLink href="/" label="Accueil" />
            <NavLink href="/works" label="Catalogue" />
            <NavLink href="/library" label="Bibliothèque" />
            <NavLink href="/creator" label="Créateur" />
            <NavLink href="/meetings" label="Réunions" />
            <NavLink href="/messages" label="Messages" />
            {sessionUser?.role === "admin" ? <NavLink href="/admin" label="Admin" /> : null}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <Link href="/cart" className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
              Panier ({cartCount})
            </Link>
            {sessionUser ? (
              <>
                <Link href="/profile" className="rounded-full bg-white/5 px-3 py-2 text-sm text-slate-100 hover:bg-white/10">
                  {sessionUser.displayName}
                </Link>
                <button type="button" onClick={() => void handleLogout()} className="rounded-full px-3 py-2 text-sm text-slate-300 hover:bg-white/10">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <NavLink href="/login" label="Connexion" />
                <Link href="/register" className="rounded-full bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200">
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-white/10 px-4 py-4 sm:hidden">
            <div className="flex flex-col gap-2">
              <NavLink href="/" label="Accueil" />
              <NavLink href="/works" label="Catalogue" />
              <NavLink href="/library" label="Bibliothèque" />
              <NavLink href="/creator" label="Créateur" />
              <NavLink href="/meetings" label="Réunions" />
              <NavLink href="/messages" label="Messages" />
              <NavLink href="/cart" label={`Panier (${cartCount})`} />
              {sessionUser?.role === "admin" ? <NavLink href="/admin" label="Admin" /> : null}
              {sessionUser ? (
                <>
                  <NavLink href="/profile" label="Profil" />
                  <button type="button" onClick={() => void handleLogout()} className="rounded-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/10">
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <NavLink href="/login" label="Connexion" />
                  <NavLink href="/register" label="Créer un compte" />
                </>
              )}
            </div>
          </div>
        ) : null}
      </header>

      {hero}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
    </div>
  );
}
