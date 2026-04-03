import { requireSessionUser } from "@/services/server/auth";
import { createMeeting, getMeetings } from "@/services/server/community";
import { jsonError, jsonOk } from "@/services/server/http";

export async function GET() {
  const auth = await requireSessionUser();
  if ("error" in auth) {
    return auth.error;
  }

  return jsonOk({ meetings: await getMeetings(auth.user.id) });
}

export async function POST(request: Request) {
  const auth = await requireSessionUser();
  if ("error" in auth) {
    return auth.error;
  }

  const result = await createMeeting(auth.user, await request.json());
  if ("error" in result) {
    return jsonError("Création de réunion impossible.", 400, result.error);
  }

  return jsonOk(result);
}
