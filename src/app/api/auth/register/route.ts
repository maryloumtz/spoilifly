import { NextResponse } from "next/server";
import { applySessionCookie, registerUser } from "@/services/server/auth";
import { jsonError } from "@/services/server/http";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string; displayName?: string };
  const result = await registerUser({
    email: body.email ?? "",
    password: body.password ?? "",
    displayName: body.displayName ?? "",
  });

  if (result.error) {
    return jsonError("Validation impossible.", 400, result.error);
  }

  const response = NextResponse.json({ user: result.user });
  applySessionCookie(response, result.user);
  return response;
}
