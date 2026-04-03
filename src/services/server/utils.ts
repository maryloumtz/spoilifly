import { createHmac, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

const PASSWORD_ITERATIONS = 120000;
const HASH_BYTES = 64;
const DIGEST = "sha512";

export function createId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, HASH_BYTES, DIGEST).toString("hex");
  return `pbkdf2$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, encodedHash: string): boolean {
  const [scheme, iterations, salt, expected] = encodedHash.split("$");

  if (scheme !== "pbkdf2" || !iterations || !salt || !expected) {
    return false;
  }

  const calculated = pbkdf2Sync(password, salt, Number(iterations), HASH_BYTES, DIGEST);
  const expectedBuffer = Buffer.from(expected, "hex");

  if (calculated.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(calculated, expectedBuffer);
}

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function signValue(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function sanitizeText(value: string): string {
  return value.replace(/[<>]/g, "").trim();
}

export function sanitizeMultilineText(value: string): string {
  return value
    .replace(/[<>]/g, "")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

export function slugify(value: string): string {
  return sanitizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
