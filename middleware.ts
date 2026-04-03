import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHmac } from "node:crypto";

const SESSION_COOKIE = "spoilifly_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "spoilifly-dev-secret";

function hasValidSession(request: NextRequest): boolean {
  const value = request.cookies.get(SESSION_COOKIE)?.value;
  if (!value) {
    return false;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return false;
  }

  const expected = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return expected === signature;
}

function getRole(request: NextRequest): string | null {
  const value = request.cookies.get(SESSION_COOKIE)?.value;
  if (!value) {
    return null;
  }

  const [payload] = value.split(".");
  if (!payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { role?: string };
    return parsed.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiresAuth = ["/profile", "/library", "/cart", "/checkout/success", "/checkout/simulated-stripe", "/creator", "/messages", "/meetings"].some(
    (prefix) => pathname.startsWith(prefix),
  );
  const requiresAdmin = pathname.startsWith("/admin");

  if (requiresAuth && !hasValidSession(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (requiresAdmin) {
    if (!hasValidSession(request)) {
      return NextResponse.redirect(new URL("/login?redirect=/admin", request.url));
    }

    const role = getRole(request);
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/library/:path*", "/cart/:path*", "/checkout/:path*", "/admin/:path*", "/creator/:path*", "/messages/:path*", "/meetings/:path*"],
};
