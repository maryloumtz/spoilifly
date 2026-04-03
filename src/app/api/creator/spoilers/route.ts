import { requireSessionUser } from "@/services/server/auth";
import { publishSpoiler } from "@/services/server/community";
import { jsonError, jsonOk } from "@/services/server/http";

export async function POST(request: Request) {
  const auth = await requireSessionUser();
  if ("error" in auth) {
    return auth.error;
  }

  const result = await publishSpoiler(auth.user, await request.json());
  if ("error" in result) {
    return jsonError("Publication impossible.", 400, result.error);
  }

  return jsonOk(result);
}
