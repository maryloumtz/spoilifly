"use client";

import { useEffect, useState } from "react";
import type { SpoilerDetailView } from "@/models/view";
import { ApiClientError } from "@/services/apiClient";
import { fetchSpoiler } from "@/services/catalogService";

export function useSpoilerDetailVM(id: string) {
  const [data, setData] = useState<SpoilerDetailView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchSpoiler(id);
        if (!cancelled) {
          setData(response.spoiler);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof ApiClientError ? error.message : "Impossible de charger le spoiler.");
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
  }, [id]);

  return { data, isLoading, error };
}
