"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthFormVM } from "@/viewmodels/useAuthFormVM";
import { AppShell } from "@/views/components/AppShell";
import { Field, StatusMessage, SubmitButton, TextInput } from "@/views/components/ui";

export default function AuthView({
  mode,
  redirectTo,
}: {
  mode: "login" | "register";
  redirectTo?: string;
}) {
  const [values, setValues] = useState({ email: "", password: "", displayName: "" });
  const { submit, isSubmitting, error, fieldErrors } = useAuthFormVM(mode, redirectTo);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
            {mode === "login" ? "Connexion" : "Inscription"}
          </p>
          <h1 className="text-3xl font-semibold text-white">
            {mode === "login" ? "Récupère tes spoilers premium" : "Crée ton compte SpoilyFly"}
          </h1>
          <p className="text-sm text-slate-300">
            {mode === "login"
              ? "Connecte-toi pour gérer ton panier, ton profil et ta bibliothèque."
              : "Inscris-toi pour acheter des spoilers individuels ou des packs complets."}
          </p>
        </div>

        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(values);
          }}
        >
          {mode === "register" ? (
            <Field label="Pseudo" error={fieldErrors.displayName}>
              <TextInput
                value={values.displayName}
                onChange={(event) => setValues((current) => ({ ...current, displayName: event.target.value }))}
                placeholder="Lina Reader"
              />
            </Field>
          ) : null}

          <Field label="Email" error={fieldErrors.email}>
            <TextInput
              type="email"
              value={values.email}
              onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
              placeholder="reader@spoilifly.local"
            />
          </Field>

          <Field label="Mot de passe" error={fieldErrors.password}>
            <TextInput
              type="password"
              value={values.password}
              onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
              placeholder="Minimum 8 caractères"
            />
          </Field>

          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

          <SubmitButton disabled={isSubmitting}>{isSubmitting ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer le compte"}</SubmitButton>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          {mode === "login" ? "Pas encore membre ?" : "Déjà un compte ?"}{" "}
          <Link href={mode === "login" ? "/register" : "/login"} className="font-semibold text-amber-300 hover:text-amber-200">
            {mode === "login" ? "Créer un compte" : "Se connecter"}
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
