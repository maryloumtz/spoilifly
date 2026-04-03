"use client";

import { useEffect, useState } from "react";
import type { WorkDetailView } from "@/models/view";
import { ApiClientError } from "@/services/apiClient";
import { fetchWork } from "@/services/catalogService";

export function useWorkDetailVM(slug: string) {
  const [data, setData] = useState<WorkDetailView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchWork(slug);
        if (!cancelled) {
          setData(response.work);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof ApiClientError ? error.message : "Impossible de charger l'oeuvre.");
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
  }, [slug]);

  return { data, isLoading, error };
}
