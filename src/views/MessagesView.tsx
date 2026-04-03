"use client";

import { useMessagesVM } from "@/viewmodels/useMessagesVM";
import { AppShell } from "@/views/components/AppShell";
import { Field, SectionTitle, StatusMessage, SubmitButton, TextArea, TextInput } from "@/views/components/ui";

export default function MessagesView() {
  const {
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
  } = useMessagesVM();

  return (
    <AppShell>
      <div className="grid gap-8 xl:grid-cols-[340px_1fr]">
        <aside className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <SectionTitle eyebrow="Messagerie" title="Conversations privées" />
          <div className="mt-6 space-y-3">
            {isLoading ? <StatusMessage>Chargement des conversations...</StatusMessage> : null}
            {data?.conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedConversationId(conversation.id)}
                className={`w-full rounded-[24px] border p-4 text-left ${selectedConversationId === conversation.id ? "border-amber-300/40 bg-amber-300/10" : "border-white/10 bg-slate-950/50"}`}
              >
                <p className="font-semibold text-white">{conversation.title}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {conversation.participants.map((entry) => entry.displayName).join(", ")}
                </p>
                {conversation.lastMessage ? <p className="mt-2 text-sm text-slate-300">{conversation.lastMessage.content}</p> : null}
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <SectionTitle title="Nouveau message" description="Tu peux discuter avec d'autres lecteurs ou créateurs à partir de leur email." />
            <form
              className="mt-6 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <Field label="Destinataire">
                <TextInput value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} placeholder="creator@spoilifly.local" />
              </Field>
              <Field label="Message">
                <TextArea value={content} onChange={(event) => setContent(event.target.value)} />
              </Field>
              {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
              <SubmitButton disabled={isSending}>{isSending ? "Envoi..." : "Envoyer"}</SubmitButton>
            </form>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <SectionTitle title="Fil de discussion" />
            <div className="mt-6 space-y-3">
              {selectedMessages.length === 0 ? <StatusMessage>Aucun message pour cette conversation.</StatusMessage> : null}
              {selectedMessages.map((message) => (
                <div key={message.id} className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-sm text-slate-100">{message.content}</p>
                  <p className="mt-2 text-xs text-slate-400">{new Date(message.createdAt).toLocaleString("fr-FR")}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
