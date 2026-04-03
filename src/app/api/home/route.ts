import { getSessionUser } from "@/services/server/auth";
import { getHomeData } from "@/services/server/catalog";
import { jsonOk } from "@/services/server/http";

export async function GET() {
  const sessionUser = await getSessionUser();
  return jsonOk(await getHomeData(sessionUser));
}
