"use client";

import { useEffect, useState } from "react";
import type { PackInput, SpoilerInput, WorkInput } from "@/models/forms";
import { ApiClientError } from "@/services/apiClient";
import {
  createPack,
  createSpoiler,
  createWork,
  deletePack,
  deleteSpoiler,
  deleteWork,
  fetchAdminReference,
  updatePack,
  updateSpoiler,
  updateWork,
  uploadMedia,
} from "@/services/adminService";

export function useAdminVM() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAdminReference>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      setData(await fetchAdminReference());
    } catch (error) {
      setError(error instanceof ApiClientError ? error.message : "Impossible de charger l'administration.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function wrap(action: () => Promise<unknown>, successMessage: string) {
    setError(null);
    setMessage(null);
    try {
      await action();
      setMessage(successMessage);
      await load();
    } catch (error) {
      setError(error instanceof ApiClientError ? error.message : "Action impossible.");
    }
  }

  return {
    data,
    isLoading,
    error,
    message,
    reload: load,
    saveWork: (id: string | null, payload: WorkInput) =>
      wrap(() => (id ? updateWork(id, payload) : createWork(payload)), "Oeuvre enregistrée."),
    removeWork: (id: string) => wrap(() => deleteWork(id), "Oeuvre supprimée."),
    saveSpoiler: (id: string | null, payload: SpoilerInput) =>
      wrap(() => (id ? updateSpoiler(id, payload) : createSpoiler(payload)), "Spoiler enregistré."),
    removeSpoiler: (id: string) => wrap(() => deleteSpoiler(id), "Spoiler supprimé."),
    savePack: (id: string | null, payload: PackInput) =>
      wrap(() => (id ? updatePack(id, payload) : createPack(payload)), "Pack enregistré."),
    removePack: (id: string) => wrap(() => deletePack(id), "Pack supprimé."),
    uploadMedia: (payload: FormData) => wrap(() => uploadMedia(payload), "Média uploadé."),
  };
}
