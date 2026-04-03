import type { MeetingInput, MessageInput, PublishSpoilerInput } from "@/models/forms";
import type { CreatorDashboardView, MeetingView, MessagesPayload } from "@/models/view";
import { apiGet, apiSend } from "@/services/apiClient";

export function fetchCreatorDashboard() {
  return apiGet<CreatorDashboardView>("/api/creator/dashboard");
}

export function publishCreatorSpoiler(payload: PublishSpoilerInput) {
  return apiSend("/api/creator/spoilers", "POST", payload);
}

export function fetchMessages() {
  return apiGet<MessagesPayload>("/api/messages");
}

export function sendMessage(payload: MessageInput) {
  return apiSend("/api/messages", "POST", payload);
}

export function fetchMeetings() {
  return apiGet<{ meetings: MeetingView[] }>("/api/meetings");
}

export function createMeeting(payload: MeetingInput) {
  return apiSend("/api/meetings", "POST", payload);
}

export function joinMeeting(meetingId: string) {
  return apiSend(`/api/meetings/${meetingId}/join`, "POST");
}

export function sendMeetingMessage(meetingId: string, content: string) {
  return apiSend(`/api/meetings/${meetingId}/messages`, "POST", { content });
}
