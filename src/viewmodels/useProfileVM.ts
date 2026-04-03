"use client";

import { useEffect, useState } from "react";
import type { ProfileInput } from "@/models/forms";
import type { PurchaseHistoryItem } from "@/models/view";
import { ApiClientError } from "@/services/apiClient";
import { fetchProfile, updateProfile } from "@/services/authService";
import { useAppVM } from "@/viewmodels/useAppVM";

export function useProfileVM() {
  const { setSessionUser } = useAppVM();
  const [purchases, setPurchases] = useState<PurchaseHistoryItem[]>([]);
  const [form, setForm] = useState<ProfileInput>({
    displayName: "",
    email: "",
    bio: "",
    avatarUrl: "",
    currentPassword: "",
    newPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchProfile();
        if (!cancelled) {
          setPurchases(data.purchases);
          setForm({
            displayName: data.user.displayName,
            email: data.user.email,
            bio: data.bio,
            avatarUrl: data.user.avatarUrl ?? "",
            currentPassword: "",
            newPassword: "",
          });
          setSessionUser(data.user);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof ApiClientError ? error.message : "Impossible de charger le profil.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [setSessionUser]);

  async function save() {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      const response = await updateProfile(form);
      setSessionUser(response.user);
      setForm((current) => ({ ...current, currentPassword: "", newPassword: "" }));
      setSuccess("Profil mis à jour.");
    } catch (error) {
      if (error instanceof ApiClientError) {
        setError(error.message);
        setFieldErrors(error.fieldErrors ?? {});
      } else {
        setError("Impossible d'enregistrer le profil.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return {
    form,
    setForm,
    purchases,
    isLoading,
    isSaving,
    error,
    success,
    fieldErrors,
    save,
  };
}
