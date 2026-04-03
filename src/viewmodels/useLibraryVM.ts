"use client";

import { useEffect, useState } from "react";
import type { LibraryEntry } from "@/models/view";
import { ApiClientError } from "@/services/apiClient";
import { fetchLibrary } from "@/services/catalogService";

export function useLibraryVM() {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchLibrary();
        if (!cancelled) {
          setEntries(data.entries);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof ApiClientError ? error.message : "Impossible de charger la bibliothèque.");
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

  return { entries, isLoading, error };
}
