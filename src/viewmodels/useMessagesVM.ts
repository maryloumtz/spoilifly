"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiClientError } from "@/services/apiClient";
import { fetchMessages, sendMessage } from "@/services/communityService";

export function useMessagesVM() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchMessages>> | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [content, setContent] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const payload = await fetchMessages();
      setData(payload);
      setSelectedConversationId((current) => current ?? payload.conversations[0]?.id ?? null);
    } catch (error) {
      setError(error instanceof ApiClientError ? error.message : "Impossible de charger la messagerie.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const selectedMessages = useMemo(
    () => data?.messages.filter((entry) => entry.conversationId === selectedConversationId) ?? [],
    [data?.messages, selectedConversationId],
  );

  async function submit() {
    setIsSending(true);
    setError(null);
    try {
      await sendMessage({ recipientEmail, content });
      setContent("");
      await load();
    } catch (error) {
      setError(error instanceof ApiClientError ? error.message : "Envoi impossible.");
    } finally {
      setIsSending(false);
    }
  }

  return {
    data,
    recipientEmail,
    setRecipientEmail,
    content,
    setContent,
    selectedConversationId,
    setSelectedConversationId,
    selectedMessages,
    isLoading,
    isSending,
    error,
    submit,
  };
}
