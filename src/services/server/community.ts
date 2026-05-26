import type {
  ChatMessage,
  MeetingAttendee,
  SessionUser,
  SpoilItem,
  SpoilMeeting,
  WalletEntry,
} from "@/models/domain";
import type { MeetingInput, MessageInput, PublishSpoilerInput } from "@/models/forms";
import type {
  ConversationView,
  CreatorDashboardView,
  MeetingView,
  MessagesPayload,
  UsersPayload,
} from "@/models/view";
import { mutateDatabase, readDatabase } from "@/services/server/db";
import { createId, nowIso, sanitizeMultilineText, slugify } from "@/services/server/utils";
import { validateMeeting, validateMessage, validatePublishSpoiler } from "@/services/server/validators";

function toSessionUser(db: Awaited<ReturnType<typeof readDatabase>>, userId: string): SessionUser {
  const user = db.users.find((entry) => entry.id === userId)!;
  const profile = db.profiles.find((entry) => entry.userId === userId)!;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
  };
}

function findWorkByTitle(db: Awaited<ReturnType<typeof readDatabase>>, title: string) {
  return db.works.find((entry) => entry.title.toLowerCase() === title.toLowerCase());
}

function createAutoWork(
  db: Awaited<ReturnType<typeof readDatabase>>,
  workTitle: string,
  spoilerTitle: string,
) {
  const now = nowIso();
  const baseSlug = slugify(workTitle) || `work-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 2;
  while (db.works.some((entry) => entry.slug === slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const work = {
    id: createId("work"),
    slug,
    title: workTitle,
    description: `Oeuvre ajoutée automatiquement depuis la publication du spoil "${spoilerTitle}".`,
    type: "movie" as const,
    categoryId: db.categories[0]?.id ?? "",
    tagIds: [],
    coverImage: "/covers/interstellar.svg",
    releaseYear: new Date().getFullYear(),
    spoilZoneLabel: "Zone spoiler",
    spoilZoneX: 50,
    spoilZoneY: 50,
    createdAt: now,
    updatedAt: now,
  };
  db.works.push(work);
  return work;
}

export async function publishSpoiler(user: SessionUser, input: PublishSpoilerInput) {
  const validation = validatePublishSpoiler(input);
  if (validation.errors) {
    return { error: validation.errors };
  }

  return mutateDatabase((db) => {
    let work = db.works.find((entry) => entry.id === validation.data!.workId);

    if (!work && validation.data!.workTitle) {
      work = findWorkByTitle(db, validation.data!.workTitle);
    }

    if (!work && validation.data!.workTitle) {
      work = createAutoWork(db, validation.data!.workTitle, validation.data!.title);
    }

    if (!work) {
      return { error: { workId: "Oeuvre introuvable." } };
    }

    const now = nowIso();
    const spoiler: SpoilItem = {
      id: createId("spoil"),
      workId: work.id,
      title: validation.data!.title,
      teaser: validation.data!.teaser,
      premiumContent: validation.data!.premiumContent,
      level: validation.data!.level as SpoilItem["level"],
      tagIds: validation.data!.tagIds,
      mediaIds: [],
      priceCents: validation.data!.priceCents,
      creatorUserId: user.id,
      status: "published",
      createdAt: now,
      updatedAt: now,
    };
    db.spoilers.push(spoiler);
    return { spoiler };
  });
}

export async function getCreatorDashboard(userId: string): Promise<CreatorDashboardView> {
  const db = await readDatabase();
  const spoilers = db.spoilers
    .filter((entry) => entry.creatorUserId === userId)
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      teaser: entry.teaser,
      priceCents: entry.priceCents,
      status: entry.status,
      createdAt: entry.createdAt,
      level: entry.level,
      workTitle: db.works.find((work) => work.id === entry.workId)?.title ?? "Oeuvre inconnue",
    }));

  const walletEntries = db.walletEntries
    .filter((entry) => entry.userId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return {
    spoilers,
    walletEntries,
    availableBalanceCents: walletEntries.reduce((sum, entry) => sum + entry.amountCents, 0),
  };
}

export async function getMessagesForUser(userId: string): Promise<MessagesPayload> {
  const db = await readDatabase();
  const conversations = db.conversations
    .filter((entry) => entry.participantUserIds.includes(userId))
    .map<ConversationView>((conversation) => ({
      ...conversation,
      participants: conversation.participantUserIds.map((entry) => toSessionUser(db, entry)),
      lastMessage:
        [...db.messages]
          .filter((entry) => entry.conversationId === conversation.id)
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0] ?? null,
    }))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  const conversationIds = conversations.map((entry) => entry.id);
  const messages = db.messages
    .filter((entry) => entry.conversationId && conversationIds.includes(entry.conversationId))
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));

  return { conversations, messages };
}

export async function getUsersDirectory(currentUserId: string): Promise<UsersPayload> {
  const db = await readDatabase();
  const users = db.users
    .filter((entry) => entry.id !== currentUserId)
    .map((entry) => toSessionUser(db, entry.id))
    .sort((left, right) => left.displayName.localeCompare(right.displayName));

  return { users };
}

export async function sendDirectMessage(user: SessionUser, input: MessageInput) {
  const validation = validateMessage(input);
  if (validation.errors) {
    return { error: validation.errors };
  }

  return mutateDatabase((db) => {
    const recipient = db.users.find((entry) => entry.email === validation.data!.recipientEmail);
    if (!recipient) {
      return { error: { recipientEmail: "Utilisateur introuvable." } };
    }

    let conversation = db.conversations.find(
      (entry) =>
        entry.participantUserIds.length === 2 &&
        entry.participantUserIds.includes(user.id) &&
        entry.participantUserIds.includes(recipient.id),
    );

    const now = nowIso();
    if (!conversation) {
      conversation = {
        id: createId("conversation"),
        participantUserIds: [user.id, recipient.id],
      title: `Conversation ${user.displayName} / ${recipient.email}`,
      createdAt: now,
      updatedAt: now,
      };
      db.conversations.push(conversation);
    }

    conversation.updatedAt = now;
    const message: ChatMessage = {
      id: createId("message"),
      conversationId: conversation.id,
      meetingId: null,
      senderUserId: user.id,
      content: validation.data!.content,
      createdAt: now,
    };
    db.messages.push(message);

    return { message };
  });
}

export async function getMeetings(userId: string): Promise<MeetingView[]> {
  const db = await readDatabase();

  return db.meetings
    .map((meeting) => {
      const attendees = db.meetingAttendees.filter((entry) => entry.meetingId === meeting.id);
      return {
        ...meeting,
        workTitle: db.works.find((entry) => entry.id === meeting.workId)?.title ?? "Oeuvre inconnue",
        host: toSessionUser(db, meeting.hostUserId),
        attendeeCount: attendees.length,
        isJoined: attendees.some((entry) => entry.userId === userId),
        attendees,
        messages: db.messages
          .filter((entry) => entry.meetingId === meeting.id)
          .sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
      };
    })
    .sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt));
}

export async function createMeeting(user: SessionUser, input: MeetingInput) {
  const validation = validateMeeting(input);
  if (validation.errors) {
    return { error: validation.errors };
  }

  return mutateDatabase((db) => {
    const work = db.works.find((entry) => entry.id === validation.data!.workId);
    if (!work) {
      return { error: { workId: "Oeuvre introuvable." } };
    }

    const meeting: SpoilMeeting = {
      id: createId("meeting"),
      workId: validation.data!.workId,
      hostUserId: user.id,
      title: validation.data!.title,
      description: validation.data!.description,
      scheduledAt: validation.data!.scheduledAt,
      priceCents: validation.data!.priceCents,
      status: "scheduled",
      createdAt: nowIso(),
    };
    db.meetings.push(meeting);
    return { meeting };
  });
}

export async function joinMeeting(userId: string, meetingId: string) {
  return mutateDatabase((db) => {
    const meeting = db.meetings.find((entry) => entry.id === meetingId);
    if (!meeting) {
      return { error: "Réunion introuvable." };
    }

    const existing = db.meetingAttendees.find((entry) => entry.meetingId === meetingId && entry.userId === userId);
    if (!existing) {
      const attendee: MeetingAttendee = {
        id: createId("meeting-attendee"),
        meetingId,
        userId,
        joinedAt: nowIso(),
      };
      db.meetingAttendees.push(attendee);
    }

    return { ok: true };
  });
}

export async function sendMeetingMessage(userId: string, meetingId: string, content: string) {
  return mutateDatabase((db) => {
    const meeting = db.meetings.find((entry) => entry.id === meetingId);
    if (!meeting) {
      return { error: "Réunion introuvable." };
    }

    const attendee = db.meetingAttendees.find((entry) => entry.meetingId === meetingId && entry.userId === userId);
    if (!attendee && meeting.hostUserId !== userId) {
      return { error: "Rejoins la réunion avant d'envoyer un message." };
    }

    const message: ChatMessage = {
      id: createId("message"),
      conversationId: null,
      meetingId,
      senderUserId: userId,
      content: sanitizeMultilineText(content),
      createdAt: nowIso(),
    };
    db.messages.push(message);
    return { message };
  });
}

export function createWalletEntry(
  walletEntries: WalletEntry[],
  entry: Omit<WalletEntry, "id" | "createdAt">,
) {
  walletEntries.push({
    id: createId("wallet"),
    createdAt: nowIso(),
    ...entry,
  });
}
