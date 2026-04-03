import { requireAdminUser } from "@/services/server/auth";
import { getAdminReferenceData } from "@/services/server/catalog";
import { jsonOk } from "@/services/server/http";

export async function GET() {
  const auth = await requireAdminUser();
  if ("error" in auth) {
    return auth.error;
  }

  return jsonOk(await getAdminReferenceData());
}
