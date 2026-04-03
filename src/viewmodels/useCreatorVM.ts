"use client";

import { useEffect, useState } from "react";
import type { PublishSpoilerInput } from "@/models/forms";
import type { CreatorDashboardView } from "@/models/view";
import { ApiClientError } from "@/services/apiClient";
import { fetchCreatorDashboard, publishCreatorSpoiler } from "@/services/communityService";

export function useCreatorVM() {
  const [data, setData] = useState<CreatorDashboardView | null>(null);
  const [form, setForm] = useState<PublishSpoilerInput>({
    workId: "",
    workTitle: "",
    title: "",
    teaser: "",
    premiumContent: "",
    level: "major",
    tagIds: [],
    priceCents: 490,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      setData(await fetchCreatorDashboard());
    } catch (error) {
      setError(error instanceof ApiClientError ? error.message : "Impossible de charger l'espace créateur.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit() {
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    setSuccess(null);
    try {
      await publishCreatorSpoiler(form);
      setSuccess("Spoil publié et visible dans le catalogue.");
      setForm({
        workId: "",
        workTitle: "",
        title: "",
        teaser: "",
        premiumContent: "",
        level: "major",
        tagIds: [],
        priceCents: 490,
      });
      await load();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setError(error.message);
        setFieldErrors(error.fieldErrors ?? {});
      } else {
        setError("Publication impossible.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return { data, form, setForm, isLoading, isSubmitting, error, fieldErrors, success, submit, reload: load };
}
