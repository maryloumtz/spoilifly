import { apiGet, apiSend } from "@/services/apiClient";
import type { PackInput, SpoilerInput, WorkInput } from "@/models/forms";

export function fetchAdminReference() {
  return apiGet<{
    works: import("@/models/domain").Work[];
    spoilers: import("@/models/domain").SpoilItem[];
    packs: import("@/models/domain").Pack[];
    categories: import("@/models/domain").Category[];
    tags: import("@/models/domain").Tag[];
    media: import("@/models/domain").Media[];
  }>("/api/admin/reference");
}

export function createWork(payload: WorkInput) {
  return apiSend("/api/admin/works", "POST", payload);
}

export function updateWork(id: string, payload: WorkInput) {
  return apiSend(`/api/admin/works/${id}`, "PATCH", payload);
}

export function deleteWork(id: string) {
  return apiSend(`/api/admin/works/${id}`, "DELETE");
}

export function createSpoiler(payload: SpoilerInput) {
  return apiSend("/api/admin/spoilers", "POST", payload);
}

export function updateSpoiler(id: string, payload: SpoilerInput) {
  return apiSend(`/api/admin/spoilers/${id}`, "PATCH", payload);
}

export function deleteSpoiler(id: string) {
  return apiSend(`/api/admin/spoilers/${id}`, "DELETE");
}

export function createPack(payload: PackInput) {
  return apiSend("/api/admin/packs", "POST", payload);
}

export function updatePack(id: string, payload: PackInput) {
  return apiSend(`/api/admin/packs/${id}`, "PATCH", payload);
}

export function deletePack(id: string) {
  return apiSend(`/api/admin/packs/${id}`, "DELETE");
}

export function uploadMedia(payload: FormData) {
  return apiSend<{ media: import("@/models/domain").Media }>("/api/upload", "POST", payload);
}
