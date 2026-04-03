import { confirmCheckoutSession } from "@/services/server/checkout";
import { requireSessionUser } from "@/services/server/auth";
import { jsonError, jsonOk } from "@/services/server/http";

export async function POST(request: Request) {
  const auth = await requireSessionUser();
  if ("error" in auth) {
    return auth.error;
  }

  const body = (await request.json()) as { sessionId?: string };
  if (!body.sessionId) {
    return jsonError("Session manquante.", 400);
  }

  const result = await confirmCheckoutSession(body.sessionId as string, auth.user.id);
  if ("error" in result) {
    return jsonError(result.error as string, 400);
  }

  return jsonOk(result);
}
