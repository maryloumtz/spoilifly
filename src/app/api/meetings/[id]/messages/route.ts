import { requireSessionUser } from "@/services/server/auth";
import { sendMeetingMessage } from "@/services/server/community";
import { jsonError, jsonOk } from "@/services/server/http";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSessionUser();
  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const body = (await request.json()) as { content?: string };
  const result = await sendMeetingMessage(auth.user.id, id as string, body.content ?? "");
  if ("error" in result) {
    return jsonError(result.error as string, 400);
  }

  return jsonOk(result);
}
