import { requireSessionUser } from "@/services/server/auth";
import { getLibrary } from "@/services/server/catalog";
import { jsonOk } from "@/services/server/http";

export async function GET() {
  const result = await requireSessionUser();
  if ("error" in result) {
    return result.error;
  }

  return jsonOk({ entries: await getLibrary(result.user.id) });
}
