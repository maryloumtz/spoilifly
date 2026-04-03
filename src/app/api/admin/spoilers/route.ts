import { createSpoiler } from "@/services/server/admin";
import { requireAdminUser } from "@/services/server/auth";
import { jsonError, jsonOk } from "@/services/server/http";

export async function POST(request: Request) {
  const auth = await requireAdminUser();
  if ("error" in auth) {
    return auth.error;
  }

  const result = await createSpoiler(await request.json());
  if ("error" in result) {
    return jsonError("Création impossible.", 400, result.error);
  }

  return jsonOk(result);
}
