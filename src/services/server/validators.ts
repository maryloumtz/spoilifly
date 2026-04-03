import type {
  LoginInput,
  MeetingInput,
  MessageInput,
  PackInput,
  ProfileInput,
  PublishSpoilerInput,
  RegisterInput,
  SimulatedPaymentInput,
  SpoilerInput,
  ValidationResult,
  WorkInput,
} from "@/models/forms";
import type { SpoilLevel, WorkType } from "@/models/domain";
import { sanitizeMultilineText, sanitizeText } from "@/services/server/utils";

const WORK_TYPES: WorkType[] = ["movie", "series", "book", "anime", "game"];
const SPOIL_LEVELS: SpoilLevel[] = ["light", "major", "ending"];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateLogin(input: LoginInput): ValidationResult<LoginInput> {
  const email = sanitizeText(input.email).toLowerCase();
  const password = input.password.trim();
  const errors: Record<string, string> = {};

  if (!isValidEmail(email)) {
    errors.email = "Adresse email invalide.";
  }

  if (password.length < 8) {
    errors.password = "Le mot de passe doit contenir au moins 8 caractères.";
  }

  return Object.keys(errors).length > 0 ? { errors } : { data: { email, password } };
}

export function validateRegister(input: RegisterInput): ValidationResult<RegisterInput> {
  const base = validateLogin(input);
  const displayName = sanitizeText(input.displayName);
  const errors = { ...(base.errors ?? {}) };

  if (displayName.length < 2) {
    errors.displayName = "Le pseudo doit contenir au moins 2 caractères.";
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : { data: { email: base.data!.email, password: base.data!.password, displayName } };
}

export function validateProfile(input: ProfileInput): ValidationResult<ProfileInput> {
  const displayName = sanitizeText(input.displayName);
  const email = sanitizeText(input.email).toLowerCase();
  const bio = sanitizeMultilineText(input.bio);
  const avatarUrl = sanitizeText(input.avatarUrl);
  const currentPassword = input.currentPassword?.trim();
  const newPassword = input.newPassword?.trim();
  const errors: Record<string, string> = {};

  if (displayName.length < 2) {
    errors.displayName = "Le pseudo doit contenir au moins 2 caractères.";
  }

  if (!isValidEmail(email)) {
    errors.email = "Adresse email invalide.";
  }

  if (bio.length > 280) {
    errors.bio = "La bio ne peut pas dépasser 280 caractères.";
  }

  if (avatarUrl && !/^https?:\/\/.+/.test(avatarUrl) && !avatarUrl.startsWith("/")) {
    errors.avatarUrl = "L'avatar doit être une URL http(s) ou un chemin local.";
  }

  if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
    errors.newPassword = "Renseigne l'ancien et le nouveau mot de passe.";
  }

  if (newPassword && newPassword.length < 8) {
    errors.newPassword = "Le nouveau mot de passe doit contenir au moins 8 caractères.";
  }

  return Object.keys(errors).length > 0
    ? { errors }
    : { data: { displayName, email, bio, avatarUrl, currentPassword, newPassword } };
}

export function validateWork(input: WorkInput): ValidationResult<WorkInput> {
  const payload: WorkInput = {
    ...input,
    slug: sanitizeText(input.slug).toLowerCase(),
    title: sanitizeText(input.title),
    description: sanitizeMultilineText(input.description),
    coverImage: sanitizeText(input.coverImage),
    spoilZoneLabel: sanitizeText(input.spoilZoneLabel),
    tagIds: input.tagIds,
  };
  const errors: Record<string, string> = {};

  if (!WORK_TYPES.includes(payload.type as WorkType)) {
    errors.type = "Type d'oeuvre invalide.";
  }

  if (!/^[a-z0-9-]+$/.test(payload.slug)) {
    errors.slug = "Le slug doit contenir uniquement lettres, chiffres et tirets.";
  }

  if (payload.title.length < 2) {
    errors.title = "Titre trop court.";
  }

  if (payload.description.length < 20) {
    errors.description = "Description trop courte.";
  }

  if (payload.releaseYear < 1900 || payload.releaseYear > 2100) {
    errors.releaseYear = "Année invalide.";
  }

  if (payload.spoilZoneX < 0 || payload.spoilZoneX > 100 || payload.spoilZoneY < 0 || payload.spoilZoneY > 100) {
    errors.spoilZoneX = "Coordonnées de carte invalides.";
  }

  return Object.keys(errors).length > 0 ? { errors } : { data: payload };
}

export function validateSpoiler(input: SpoilerInput): ValidationResult<SpoilerInput> {
  const payload: SpoilerInput = {
    ...input,
    title: sanitizeText(input.title),
    teaser: sanitizeMultilineText(input.teaser),
    premiumContent: sanitizeMultilineText(input.premiumContent),
  };
  const errors: Record<string, string> = {};

  if (!SPOIL_LEVELS.includes(payload.level as SpoilLevel)) {
    errors.level = "Niveau de spoil invalide.";
  }

  if (payload.title.length < 2) {
    errors.title = "Titre trop court.";
  }

  if (payload.teaser.length < 20) {
    errors.teaser = "Teaser trop court.";
  }

  if (payload.premiumContent.length < 30) {
    errors.premiumContent = "Contenu premium trop court.";
  }

  if (payload.priceCents < 99) {
    errors.priceCents = "Le prix minimum est 0,99 EUR.";
  }

  return Object.keys(errors).length > 0 ? { errors } : { data: payload };
}

export function validatePack(input: PackInput): ValidationResult<PackInput> {
  const payload: PackInput = {
    ...input,
    title: sanitizeText(input.title),
    description: sanitizeMultilineText(input.description),
  };
  const errors: Record<string, string> = {};

  if (payload.title.length < 2) {
    errors.title = "Titre trop court.";
  }

  if (payload.description.length < 20) {
    errors.description = "Description trop courte.";
  }

  if (payload.spoilIds.length === 0) {
    errors.spoilIds = "Sélectionne au moins un spoiler.";
  }

  if (payload.priceCents < 99) {
    errors.priceCents = "Le prix minimum est 0,99 EUR.";
  }

  return Object.keys(errors).length > 0 ? { errors } : { data: payload };
}

export function validatePublishSpoiler(input: PublishSpoilerInput): ValidationResult<PublishSpoilerInput> {
  const base = validateSpoiler({ ...input, mediaIds: [] });
  if (base.errors) {
    return { errors: base.errors };
  }

  const workId = sanitizeText(input.workId);
  const workTitle = sanitizeText(input.workTitle ?? "");
  const errors: Record<string, string> = {};

  if (!workId && workTitle.length < 2) {
    errors.workId = "Sélectionne une oeuvre ou saisis un nouveau titre.";
    errors.workTitle = "Renseigne un titre d'oeuvre.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      workId,
      workTitle,
      title: base.data!.title,
      teaser: base.data!.teaser,
      premiumContent: base.data!.premiumContent,
      level: base.data!.level,
      tagIds: base.data!.tagIds,
      priceCents: base.data!.priceCents,
    },
  };
}

export function validateMessage(input: MessageInput): ValidationResult<MessageInput> {
  const recipientEmail = sanitizeText(input.recipientEmail).toLowerCase();
  const content = sanitizeMultilineText(input.content);
  const errors: Record<string, string> = {};

  if (!isValidEmail(recipientEmail)) {
    errors.recipientEmail = "Destinataire invalide.";
  }

  if (content.length < 2) {
    errors.content = "Message trop court.";
  }

  return Object.keys(errors).length > 0 ? { errors } : { data: { recipientEmail, content } };
}

export function validateMeeting(input: MeetingInput): ValidationResult<MeetingInput> {
  const data: MeetingInput = {
    ...input,
    workId: sanitizeText(input.workId),
    title: sanitizeText(input.title),
    description: sanitizeMultilineText(input.description),
    scheduledAt: sanitizeText(input.scheduledAt),
  };
  const errors: Record<string, string> = {};

  if (!data.workId) {
    errors.workId = "Sélectionne une oeuvre.";
  }

  if (data.title.length < 4) {
    errors.title = "Titre trop court.";
  }

  if (data.description.length < 20) {
    errors.description = "Description trop courte.";
  }

  if (Number.isNaN(Date.parse(data.scheduledAt))) {
    errors.scheduledAt = "Date de réunion invalide.";
  }

  if (data.priceCents < 0) {
    errors.priceCents = "Prix invalide.";
  }

  return Object.keys(errors).length > 0 ? { errors } : { data };
}

export function validateSimulatedPayment(input: SimulatedPaymentInput): ValidationResult<SimulatedPaymentInput> {
  const data: SimulatedPaymentInput = {
    sessionId: sanitizeText(input.sessionId),
    cardholderName: sanitizeText(input.cardholderName),
    cardNumber: sanitizeText(input.cardNumber).replace(/\s+/g, ""),
    expiry: sanitizeText(input.expiry),
    cvc: sanitizeText(input.cvc),
    billingEmail: sanitizeText(input.billingEmail).toLowerCase(),
  };
  const errors: Record<string, string> = {};

  if (data.cardholderName.length < 2) {
    errors.cardholderName = "Nom du titulaire invalide.";
  }

  if (!/^\d{16}$/.test(data.cardNumber) || !data.cardNumber.startsWith("4242")) {
    errors.cardNumber = "Utilise une carte de test commençant par 4242.";
  }

  if (!/^\d{2}\/\d{2}$/.test(data.expiry)) {
    errors.expiry = "Format attendu MM/AA.";
  }

  if (!/^\d{3,4}$/.test(data.cvc)) {
    errors.cvc = "Code CVC invalide.";
  }

  if (!isValidEmail(data.billingEmail)) {
    errors.billingEmail = "Email de facturation invalide.";
  }

  return Object.keys(errors).length > 0 ? { errors } : { data };
}
