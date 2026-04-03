"use client";

import { useEffect, useState } from "react";
import type { WorkFilters } from "@/models/view";
import type { CatalogResponse } from "@/services/catalogService";
import { fetchCatalog } from "@/services/catalogService";
import { ApiClientError } from "@/services/apiClient";

const DEFAULT_FILTERS: WorkFilters = {
  search: "",
  type: "all",
  category: "",
  tag: "",
  level: "all",
  sort: "popular",
};

export function useCatalogVM(initialFilters?: Partial<WorkFilters>) {
  const [filters, setFilters] = useState<WorkFilters>({ ...DEFAULT_FILTERS, ...initialFilters });
  const [state, setState] = useState<{
    data: CatalogResponse | null;
    isLoading: boolean;
    error: string | null;
  }>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((current) => ({ ...current, isLoading: true, error: null }));
      try {
        const data = await fetchCatalog(filters);
        if (!cancelled) {
          setState({ data, isLoading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            isLoading: false,
            error: error instanceof ApiClientError ? error.message : "Impossible de charger le catalogue.",
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  return {
    ...state,
    filters,
    setFilters,
  };
}
