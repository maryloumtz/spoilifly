import type { ApiErrorPayload } from "@/models/domain";

export class ApiClientError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiClientError";
    this.fieldErrors = fieldErrors;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T | ApiErrorPayload;

  if (!response.ok) {
    const errorPayload = payload as ApiErrorPayload;
    throw new ApiClientError(errorPayload.error || "Une erreur est survenue.", errorPayload.fieldErrors);
  }

  return payload as T;
}

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return parseResponse<T>(response);
}

export async function apiSend<T>(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(response);
}
