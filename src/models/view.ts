import type {
  ChatMessage,
  Category,
  Conversation,
  MeetingAttendee,
  Media,
  Pack,
  SessionUser,
  SpoilItem,
  SpoilLevel,
  SpoilMeeting,
  Tag,
  Work,
  WorkType,
  WalletEntry,
} from "@/models/domain";

export interface WorkFilters {
  search: string;
  type: WorkType | "all";
  category: string;
  tag: string;
  level: SpoilLevel | "all";
  sort: "popular" | "recent" | "price_asc" | "price_desc" | "title";
}

export interface SpoilerSummary extends Pick<SpoilItem, "id" | "title" | "teaser" | "level" | "priceCents"> {
  isOwned: boolean;
  tags: Tag[];
}

export interface PackSummary extends Pick<Pack, "id" | "title" | "description" | "priceCents"> {
  spoilCount: number;
  isOwned: boolean;
}

export interface WorkCardView extends Pick<Work, "id" | "slug" | "title" | "description" | "type" | "coverImage" | "releaseYear"> {
  category: Category | null;
  tags: Tag[];
  lowestPriceCents: number;
  spoilerCount: number;
  pack: PackSummary | null;
}

export interface WorkDetailView extends WorkCardView {
  spoilZoneLabel: string;
  spoilZoneX: number;
  spoilZoneY: number;
  spoilers: SpoilerSummary[];
  media: Media[];
}

export interface SpoilerDetailView extends Pick<SpoilItem, "id" | "title" | "teaser" | "level" | "priceCents"> {
  work: Pick<Work, "id" | "slug" | "title" | "coverImage">;
  tags: Tag[];
  media: Media[];
  premiumContent: string | null;
  isOwned: boolean;
  pack: PackSummary | null;
}

export interface LibraryEntry {
  work: WorkCardView;
  spoilers: SpoilerSummary[];
  pack: PackSummary | null;
}

export interface HomeSpoilerCard extends SpoilerSummary {
  work: Pick<Work, "id" | "slug" | "title" | "coverImage">;
  createdAt: string;
}

export interface HomePayload {
  featured: WorkCardView[];
  latest: WorkCardView[];
  latestSpoilers: HomeSpoilerCard[];
  categories: Category[];
}

export interface PurchaseHistoryItem {
  id: string;
  productType: "spoil" | "pack";
  productTitle: string;
  workTitle: string;
  amountCents: number;
  status: string;
  createdAt: string;
}

export interface ApiAuthPayload {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

export interface SessionPayload {
  user: SessionUser | null;
  auth?: ApiAuthPayload | null;
}

export interface ProfilePayload {
  user: SessionUser;
  bio: string;
  purchases: PurchaseHistoryItem[];
}

export interface CreatorSpoilerView extends Pick<SpoilItem, "id" | "title" | "teaser" | "priceCents" | "status" | "createdAt"> {
  workTitle: string;
  level: SpoilLevel;
}

export interface CreatorDashboardView {
  spoilers: CreatorSpoilerView[];
  walletEntries: WalletEntry[];
  availableBalanceCents: number;
}

export interface ConversationView extends Conversation {
  participants: SessionUser[];
  lastMessage: ChatMessage | null;
}

export interface MessagesPayload {
  conversations: ConversationView[];
  messages: ChatMessage[];
}

export interface MeetingView extends SpoilMeeting {
  workTitle: string;
  host: SessionUser;
  attendeeCount: number;
  isJoined: boolean;
  attendees: MeetingAttendee[];
  messages: ChatMessage[];
}
