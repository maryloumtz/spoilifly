import { NextResponse } from "next/server";
import { applySessionCookie, loginUser } from "@/services/server/auth";
import { jsonError } from "@/services/server/http";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const result = await loginUser({
    email: body.email ?? "",
    password: body.password ?? "",
  });

  if (result.error) {
    return jsonError("Connexion impossible.", 400, result.error);
  }

  const response = NextResponse.json({ user: result.user });
  applySessionCookie(response, result.user);
  return response;
}
