import { getSessionUser } from "@/services/server/auth";
import { getWorkDetail } from "@/services/server/catalog";
import { jsonError, jsonOk } from "@/services/server/http";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const sessionUser = await getSessionUser();
  const work = await getWorkDetail(slug, sessionUser);

  if (!work) {
    return jsonError("Oeuvre introuvable.", 404);
  }

  return jsonOk({ work });
}
