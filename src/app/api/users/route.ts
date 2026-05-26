import { requireSessionUser } from "@/services/server/auth";
import { getUsersDirectory } from "@/services/server/community";
import { jsonOk } from "@/services/server/http";

export async function GET() {
  const auth = await requireSessionUser();
  if ("error" in auth) {
    return auth.error;
  }

  return jsonOk(await getUsersDirectory(auth.user.id));
}
