import type { HomePayload, LibraryEntry, SpoilerDetailView, WorkDetailView, WorkFilters, WorkCardView } from "@/models/view";
import { apiGet } from "@/services/apiClient";

export interface CatalogResponse {
  works: WorkCardView[];
  categories: import("@/models/domain").Category[];
  tags: import("@/models/domain").Tag[];
}

function buildQuery(filters: Partial<WorkFilters>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export function fetchCatalog(filters: Partial<WorkFilters>) {
  const query = buildQuery(filters);
  return apiGet<CatalogResponse>(`/api/works${query ? `?${query}` : ""}`);
}

export function fetchWork(slug: string) {
  return apiGet<{ work: WorkDetailView }>(`/api/works/${slug}`);
}

export function fetchSpoiler(id: string) {
  return apiGet<{ spoiler: SpoilerDetailView }>(`/api/spoilers/${id}`);
}

export function fetchLibrary() {
  return apiGet<{ entries: LibraryEntry[] }>("/api/library");
}

export function fetchHome() {
  return apiGet<HomePayload>("/api/home");
}

export function fetchPurchaseHistory() {
  return apiGet<{ purchases: import("@/models/view").PurchaseHistoryItem[] }>("/api/purchases/history");
}
