"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RegisterInput } from "@/models/forms";
import { ApiClientError } from "@/services/apiClient";
import { login, register } from "@/services/authService";
import { useAppVM } from "@/viewmodels/useAppVM";

export function useAuthFormVM(mode: "login" | "register", redirectTo?: string) {
  const router = useRouter();
  const { setSessionUser } = useAppVM();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(values: { email: string; password: string; displayName?: string }) {
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const response =
        mode === "login"
          ? await login({ email: values.email, password: values.password })
          : await register(values as RegisterInput);
      setSessionUser(response.user);
      router.push(redirectTo || "/");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setError(error.message);
        setFieldErrors(error.fieldErrors ?? {});
      } else {
        setError("Une erreur inattendue est survenue.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submit, isSubmitting, error, fieldErrors };
}
