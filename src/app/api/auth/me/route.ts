import { getAuthPayload, getSessionUser } from "@/services/server/auth";
import { jsonOk } from "@/services/server/http";

export async function GET() {
  const user = await getSessionUser();
  return jsonOk(user ? getAuthPayload(user) : { user: null, auth: null });
}
