"use client";

import { useCatalogVM } from "@/viewmodels/useCatalogVM";
import { useMeetingsVM } from "@/viewmodels/useMeetingsVM";
import { formatPrice, formatPriceInput, parseEuroInput } from "@/services/formatters";
import { AppShell } from "@/views/components/AppShell";
import { Field, SectionTitle, Select, StatusMessage, SubmitButton, TextArea, TextInput } from "@/views/components/ui";

export default function MeetingsView() {
  const { data: catalog } = useCatalogVM();
  const {
    meetings,
    selectedMeetingId,
    setSelectedMeetingId,
    selectedMeeting,
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
  } = useMeetingsVM();

  return (
    <AppShell>
      <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <SectionTitle eyebrow="Réunions" title="Salons spoiler programmés" />
          <div className="mt-6 space-y-3">
            {isLoading ? <StatusMessage>Chargement des réunions...</StatusMessage> : null}
            {meetings.map((meeting) => (
              <button
                key={meeting.id}
                type="button"
                onClick={() => setSelectedMeetingId(meeting.id)}
                className={`w-full rounded-[24px] border p-4 text-left ${selectedMeetingId === meeting.id ? "border-amber-300/40 bg-amber-300/10" : "border-white/10 bg-slate-950/50"}`}
              >
                <p className="font-semibold text-white">{meeting.title}</p>
                <p className="mt-1 text-sm text-slate-300">{meeting.workTitle}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(meeting.scheduledAt).toLocaleString("fr-FR")} • {formatPrice(meeting.priceCents)}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <SectionTitle title="Créer une réunion de spoils" description="Les créateurs peuvent organiser des sessions premium ou gratuites autour d’une oeuvre." />
            <form
              className="mt-6 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void create();
              }}
            >
              <Field label="Oeuvre" error={fieldErrors.workId}>
                <Select value={meetingForm.workId} onChange={(event) => setMeetingForm((current) => ({ ...current, workId: event.target.value }))}>
                  <option value="">Choisir</option>
                  {catalog?.works.map((work) => (
                    <option key={work.id} value={work.id}>{work.title}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Titre" error={fieldErrors.title}>
                <TextInput value={meetingForm.title} onChange={(event) => setMeetingForm((current) => ({ ...current, title: event.target.value }))} />
              </Field>
              <Field label="Description" error={fieldErrors.description}>
                <TextArea value={meetingForm.description} onChange={(event) => setMeetingForm((current) => ({ ...current, description: event.target.value }))} />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Date et heure" error={fieldErrors.scheduledAt}>
                  <TextInput type="datetime-local" value={meetingForm.scheduledAt} onChange={(event) => setMeetingForm((current) => ({ ...current, scheduledAt: event.target.value }))} />
                </Field>
                <Field label="Prix (EUR)" error={fieldErrors.priceCents}>
                  <TextInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={formatPriceInput(meetingForm.priceCents)}
                    onChange={(event) => setMeetingForm((current) => ({ ...current, priceCents: parseEuroInput(event.target.value) }))}
                  />
                </Field>
              </div>
              {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
              {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}
              <SubmitButton disabled={isSubmitting}>{isSubmitting ? "Programmation..." : "Programmer"}</SubmitButton>
            </form>
          </div>

          {selectedMeeting ? (
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <SectionTitle title={selectedMeeting.title} description={selectedMeeting.description} />
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                <span>Host: {selectedMeeting.host.displayName}</span>
                <span>{selectedMeeting.attendeeCount} participants</span>
                <span>{formatPrice(selectedMeeting.priceCents)}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {!selectedMeeting.isJoined ? (
                  <button type="button" onClick={() => void join(selectedMeeting.id)} className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200">
                    Rejoindre la réunion
                  </button>
                ) : (
                  <StatusMessage tone="success">Tu participes déjà à cette réunion.</StatusMessage>
                )}
              </div>

              <div className="mt-6 space-y-3">
                {selectedMeeting.messages.map((message) => (
                  <div key={message.id} className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-sm text-slate-100">{message.content}</p>
                    <p className="mt-2 text-xs text-slate-400">{new Date(message.createdAt).toLocaleString("fr-FR")}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <Field label="Message réunion">
                  <TextArea value={messageByMeeting[selectedMeeting.id] ?? ""} onChange={(event) => setMessageByMeeting((current) => ({ ...current, [selectedMeeting.id]: event.target.value }))} />
                </Field>
                <button type="button" onClick={() => void send(selectedMeeting.id)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">
                  Envoyer au salon
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
