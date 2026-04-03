"use client";

import { useEffect, useState } from "react";
import type { HomePayload } from "@/models/view";
import { ApiClientError } from "@/services/apiClient";
import { fetchHome } from "@/services/catalogService";

export function useHomeVM() {
  const [data, setData] = useState<HomePayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const payload = await fetchHome();
        if (!cancelled) {
          setData(payload);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof ApiClientError ? loadError.message : "Impossible de charger l'accueil.");
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
  }, []);

  return { data, isLoading, error };
}
