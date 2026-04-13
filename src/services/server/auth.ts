import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import type { Profile, SessionUser, User } from "@/models/domain";
import type { LoginInput, ProfileInput, RegisterInput } from "@/models/forms";
import { mutateDatabase, readDatabase } from "@/services/server/db";
import { createId, getBaseUrl, hashPassword, signValue, verifyPassword } from "@/services/server/utils";
import { validateLogin, validateProfile, validateRegister } from "@/services/server/validators";

const SESSION_COOKIE = "spoilifly_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "spoilifly-dev-secret";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || SESSION_SECRET;
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

interface SessionToken {
  userId: string;
  role: User["role"];
  issuedAt: string;
}

interface AccessToken {
  userId: string;
  role: User["role"];
  issuedAt: string;
  expiresAt: string;
}

function encodeSession(token: SessionToken): string {
  const payload = Buffer.from(JSON.stringify(token)).toString("base64url");
  return `${payload}.${signValue(payload, SESSION_SECRET)}`;
}

function decodeSession(value: string | undefined): SessionToken | null {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature || signValue(payload, SESSION_SECRET) !== signature) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionToken;
  } catch {
    return null;
  }
}

function encodeAccessToken(token: AccessToken): string {
  const payload = Buffer.from(JSON.stringify(token)).toString("base64url");
  return `${payload}.${signValue(payload, ACCESS_TOKEN_SECRET)}`;
}

function decodeAccessToken(value: string | null): AccessToken | null {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature || signValue(payload, ACCESS_TOKEN_SECRET) !== signature) {
    return null;
  }

  try {
    const token = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AccessToken;
    if (!token.expiresAt || new Date(token.expiresAt).getTime() <= Date.now()) {
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token;
}

function toSessionUser(user: User, profile: Profile): SessionUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
  };
}

async function resolveSessionUser(userId: string): Promise<SessionUser | null> {
  const db = await readDatabase();
  const user = db.users.find((entry) => entry.id === userId);
  const profile = db.profiles.find((entry) => entry.userId === userId);

  if (!user || !profile) {
    return null;
  }

  return toSessionUser(user, profile);
}

async function getAuthorizationHeader(request?: Request): Promise<string | null> {
  if (request) {
    return request.headers.get("authorization");
  }

  const headerStore = await headers();
  return headerStore.get("authorization");
}

export function createAccessToken(user: SessionUser): string {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + ACCESS_TOKEN_TTL_SECONDS * 1000);

  return encodeAccessToken({
    userId: user.id,
    role: user.role,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
}

export function getAuthPayload(user: SessionUser) {
  return {
    user,
    auth: {
      accessToken: createAccessToken(user),
      tokenType: "Bearer" as const,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    },
  };
}

export async function getSessionUser(request?: Request): Promise<SessionUser | null> {
  const authorizationHeader = await getAuthorizationHeader(request);

  if (authorizationHeader) {
    const token = decodeAccessToken(extractBearerToken(authorizationHeader));
    if (!token) {
      return null;
    }

    return resolveSessionUser(token.userId);
  }

  const cookieStore = await cookies();
  const token = decodeSession(cookieStore.get(SESSION_COOKIE)?.value);
  return token ? resolveSessionUser(token.userId) : null;
}

export function applySessionCookie(response: NextResponse, user: SessionUser): void {
  response.cookies.set(
    SESSION_COOKIE,
    encodeSession({ userId: user.id, role: user.role, issuedAt: new Date().toISOString() }),
    {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    },
  );
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function requireSessionUser(request?: Request) {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    return { error: NextResponse.json({ error: "Authentification requise." }, { status: 401 }) };
  }

  return { user: sessionUser };
}

export async function requireAdminUser(request?: Request) {
  const result = await requireSessionUser(request);

  if ("error" in result) {
    return result;
  }

  if (result.user.role !== "admin") {
    return { error: NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 }) };
  }

  return result;
}

export async function registerUser(input: RegisterInput) {
  const validation = validateRegister(input);

  if (validation.errors) {
    return { error: validation.errors };
  }

  const { email, password, displayName } = validation.data!;

  const user = await mutateDatabase((db) => {
    const existingUser = db.users.find((entry) => entry.email === email);
    if (existingUser) {
      return null;
    }

    const now = new Date().toISOString();
    const createdUser: User = {
      id: createId("user"),
      email,
      passwordHash: hashPassword(password),
      role: "user",
      createdAt: now,
      updatedAt: now,
    };

    const profile: Profile = {
      userId: createdUser.id,
      displayName,
      avatarUrl: null,
      bio: "",
      createdAt: now,
      updatedAt: now,
    };

    db.users.push(createdUser);
    db.profiles.push(profile);

    return toSessionUser(createdUser, profile);
  });

  if (!user) {
    return { error: { email: "Un compte existe déjà avec cette adresse." } };
  }

  return { user };
}

export async function loginUser(input: LoginInput) {
  const validation = validateLogin(input);

  if (validation.errors) {
    return { error: validation.errors };
  }

  const { email, password } = validation.data!;
  const db = await readDatabase();
  const user = db.users.find((entry) => entry.email === email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: { email: "Identifiants invalides." } };
  }

  const profile = db.profiles.find((entry) => entry.userId === user.id);

  if (!profile) {
    return { error: { email: "Profil introuvable." } };
  }

  return { user: toSessionUser(user, profile) };
}

export async function updateCurrentProfile(userId: string, input: ProfileInput) {
  const validation = validateProfile(input);

  if (validation.errors) {
    return { error: validation.errors };
  }

  const data = validation.data!;

  const result = await mutateDatabase((db) => {
    const user = db.users.find((entry) => entry.id === userId);
    const profile = db.profiles.find((entry) => entry.userId === userId);

    if (!user || !profile) {
      return null;
    }

    const emailTaken = db.users.some((entry) => entry.email === data.email && entry.id !== userId);
    if (emailTaken) {
      return { type: "email" as const };
    }

    if (data.currentPassword && data.newPassword && !verifyPassword(data.currentPassword, user.passwordHash)) {
      return { type: "password" as const };
    }

    const now = new Date().toISOString();
    user.email = data.email;
    user.updatedAt = now;
    if (data.newPassword) {
      user.passwordHash = hashPassword(data.newPassword);
    }
    profile.displayName = data.displayName;
    profile.bio = data.bio;
    profile.avatarUrl = data.avatarUrl || null;
    profile.updatedAt = now;

    return { type: "ok" as const, user: toSessionUser(user, profile) };
  });

  if (!result) {
    return { error: { email: "Utilisateur introuvable." } };
  }

  if (result.type === "email") {
    return { error: { email: "Cette adresse est déjà utilisée." } };
  }

  if (result.type === "password") {
    return { error: { currentPassword: "Mot de passe actuel incorrect." } };
  }

  return { user: result.user };
}

export function buildRedirectUrl(pathname: string): string {
  return new URL(pathname, getBaseUrl()).toString();
}
