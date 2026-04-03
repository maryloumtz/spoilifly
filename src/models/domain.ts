export type UserRole = "user" | "admin";

export type WorkType = "movie" | "series" | "book" | "anime" | "game";
export type SpoilLevel = "light" | "major" | "ending";
export type ProductType = "spoil" | "pack";
export type PurchaseStatus = "pending" | "paid" | "failed";
export type CheckoutProvider = "mock_stripe";
export type MediaKind = "image" | "video";
export type SpoilStatus = "published";
export type WalletEntryType = "sale" | "meeting_ticket" | "adjustment";
export type MeetingStatus = "scheduled" | "live" | "ended";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
}

export interface Media {
  id: string;
  ownerType: "work" | "spoil";
  ownerId: string;
  kind: MediaKind;
  url: string;
  alt: string;
  createdAt: string;
}

export interface Work {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: WorkType;
  categoryId: string;
  tagIds: string[];
  coverImage: string;
  releaseYear: number;
  spoilZoneLabel: string;
  spoilZoneX: number;
  spoilZoneY: number;
  createdAt: string;
  updatedAt: string;
}

export interface SpoilItem {
  id: string;
  workId: string;
  title: string;
  teaser: string;
  premiumContent: string;
  level: SpoilLevel;
  tagIds: string[];
  mediaIds: string[];
  priceCents: number;
  creatorUserId: string;
  status: SpoilStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Pack {
  id: string;
  workId: string;
  title: string;
  description: string;
  spoilIds: string[];
  priceCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  productType: ProductType;
  productId: string;
  amountCents: number;
  status: PurchaseStatus;
  checkoutSessionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Entitlement {
  id: string;
  userId: string;
  workId: string;
  spoilId: string | null;
  packId: string | null;
  sourcePurchaseId: string;
  createdAt: string;
}

export interface CheckoutSession {
  id: string;
  userId: string;
  itemIds: string[];
  amountCents: number;
  provider: CheckoutProvider;
  status: "open" | "completed" | "expired";
  successUrl: string;
  cancelUrl: string;
  createdAt: string;
  completedAt: string | null;
}

export interface WalletEntry {
  id: string;
  userId: string;
  amountCents: number;
  type: WalletEntryType;
  sourceType: ProductType | "meeting";
  sourceId: string;
  description: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantUserIds: string[];
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string | null;
  meetingId: string | null;
  senderUserId: string;
  content: string;
  createdAt: string;
}

export interface SpoilMeeting {
  id: string;
  workId: string;
  hostUserId: string;
  title: string;
  description: string;
  scheduledAt: string;
  priceCents: number;
  status: MeetingStatus;
  createdAt: string;
}

export interface MeetingAttendee {
  id: string;
  meetingId: string;
  userId: string;
  joinedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  profiles: Profile[];
  works: Work[];
  spoilers: SpoilItem[];
  packs: Pack[];
  purchases: Purchase[];
  entitlements: Entitlement[];
  media: Media[];
  categories: Category[];
  tags: Tag[];
  checkoutSessions: CheckoutSession[];
  walletEntries: WalletEntry[];
  conversations: Conversation[];
  messages: ChatMessage[];
  meetings: SpoilMeeting[];
  meetingAttendees: MeetingAttendee[];
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl: string | null;
}

export interface ApiErrorPayload {
  error: string;
  fieldErrors?: Record<string, string>;
}
