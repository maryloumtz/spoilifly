import { getSessionUser } from "@/services/server/auth";
import { getSpoilerDetail } from "@/services/server/catalog";
import { jsonError, jsonOk } from "@/services/server/http";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const sessionUser = await getSessionUser();
  const spoiler = await getSpoilerDetail(id, sessionUser);

  if (!spoiler) {
    return jsonError("Spoiler introuvable.", 404);
  }

  return jsonOk({ spoiler });
}
