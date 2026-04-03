import { deleteSpoiler, updateSpoiler } from "@/services/server/admin";
import { requireAdminUser } from "@/services/server/auth";
import { jsonError, jsonOk } from "@/services/server/http";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const result = await updateSpoiler(id, await request.json());
  if ("error" in result) {
    return jsonError("Mise à jour impossible.", 400, result.error);
  }

  return jsonOk(result);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  return jsonOk(await deleteSpoiler(id));
}
