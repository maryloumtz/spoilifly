export interface ValidationResult<T> {
  data?: T;
  errors?: Record<string, string>;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  displayName: string;
}

export interface ProfileInput {
  displayName: string;
  email: string;
  bio: string;
  avatarUrl: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface WorkInput {
  slug: string;
  title: string;
  description: string;
  type: string;
  categoryId: string;
  tagIds: string[];
  coverImage: string;
  releaseYear: number;
  spoilZoneLabel: string;
  spoilZoneX: number;
  spoilZoneY: number;
}

export interface SpoilerInput {
  workId: string;
  title: string;
  teaser: string;
  premiumContent: string;
  level: string;
  tagIds: string[];
  mediaIds: string[];
  priceCents: number;
}

export interface PackInput {
  workId: string;
  title: string;
  description: string;
  spoilIds: string[];
  priceCents: number;
}

export interface PublishSpoilerInput {
  workId: string;
  workTitle?: string;
  title: string;
  teaser: string;
  premiumContent: string;
  level: string;
  tagIds: string[];
  priceCents: number;
}

export interface MessageInput {
  recipientEmail: string;
  content: string;
}

export interface MeetingInput {
  workId: string;
  title: string;
  description: string;
  scheduledAt: string;
  priceCents: number;
}

export interface SimulatedPaymentInput {
  sessionId: string;
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  billingEmail: string;
}
