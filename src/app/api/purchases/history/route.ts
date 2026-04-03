import { requireSessionUser } from "@/services/server/auth";
import { getPurchaseHistory } from "@/services/server/catalog";
import { jsonOk } from "@/services/server/http";

export async function GET() {
  const result = await requireSessionUser();
  if ("error" in result) {
    return result.error;
  }

  return jsonOk({ purchases: await getPurchaseHistory(result.user.id) });
}
