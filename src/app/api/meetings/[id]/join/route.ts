import { requireSessionUser } from "@/services/server/auth";
import { joinMeeting } from "@/services/server/community";
import { jsonError, jsonOk } from "@/services/server/http";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSessionUser();
  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const result = await joinMeeting(auth.user.id, id as string);
  if ("error" in result) {
    return jsonError(result.error as string, 400);
  }

  return jsonOk(result);
}
