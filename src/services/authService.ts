import type { ProfilePayload, SessionPayload } from "@/models/view";
import type { ProfileInput, RegisterInput } from "@/models/forms";
import { apiGet, apiSend } from "@/services/apiClient";

export function fetchSession() {
  return apiGet<SessionPayload>("/api/auth/me");
}

export function login(payload: { email: string; password: string }) {
  return apiSend<SessionPayload>("/api/auth/login", "POST", payload);
}

export function register(payload: RegisterInput) {
  return apiSend<SessionPayload>("/api/auth/register", "POST", payload);
}

export function logout() {
  return apiSend<{ ok: true }>("/api/auth/logout", "POST");
}

export function fetchProfile() {
  return apiGet<ProfilePayload>("/api/profile");
}

export function updateProfile(payload: ProfileInput) {
  return apiSend<{ user: NonNullable<SessionPayload["user"]> }>("/api/profile", "PATCH", payload);
}
