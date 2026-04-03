"use client";

import { useEffect, useState } from "react";
import type { MeetingInput } from "@/models/forms";
import { ApiClientError } from "@/services/apiClient";
import { createMeeting, fetchMeetings, joinMeeting, sendMeetingMessage } from "@/services/communityService";

export function useMeetingsVM() {
  const [meetings, setMeetings] = useState<Awaited<ReturnType<typeof fetchMeetings>>["meetings"]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [messageByMeeting, setMessageByMeeting] = useState<Record<string, string>>({});
  const [meetingForm, setMeetingForm] = useState<MeetingInput>({
    workId: "",
    title: "",
    description: "",
    scheduledAt: "",
    priceCents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      setError(null);
      const response = await fetchMeetings();
      setMeetings(response.meetings);
      setSelectedMeetingId((current) => current ?? response.meetings[0]?.id ?? null);
    } catch (error) {
      setError(error instanceof ApiClientError ? error.message : "Impossible de charger les réunions.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function create() {
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    setSuccess(null);
    try {
      await createMeeting(meetingForm);
      setMeetingForm({ workId: "", title: "", description: "", scheduledAt: "", priceCents: 0 });
      setSuccess("Réunion programmée.");
      await load();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setError(error.message);
        setFieldErrors(error.fieldErrors ?? {});
      } else {
        setError("Création de réunion impossible.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function join(id: string) {
    await joinMeeting(id);
    await load();
  }

  async function send(id: string) {
    await sendMeetingMessage(id, messageByMeeting[id] ?? "");
    setMessageByMeeting((current) => ({ ...current, [id]: "" }));
    await load();
  }

  return {
    meetings,
    selectedMeetingId,
    setSelectedMeetingId,
    selectedMeeting: meetings.find((entry) => entry.id === selectedMeetingId) ?? null,
    messageByMeeting,
    setMessageByMeeting,
    meetingForm,
    setMeetingForm,
    isLoading,
    isSubmitting,
    error,
    fieldErrors,
    success,
    create,
    join,
    send,
  };
}
