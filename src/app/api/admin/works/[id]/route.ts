import { deleteWork, updateWork } from "@/services/server/admin";
import { requireAdminUser } from "@/services/server/auth";
import { jsonError, jsonOk } from "@/services/server/http";

function normalizeFieldErrors(errors?: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(errors ?? {}).filter((entry): entry is [string, string] => Boolean(entry[1])));
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const result = await updateWork(id, await request.json());
  if ("error" in result) {
    return jsonError("Mise à jour impossible.", 400, normalizeFieldErrors(result.error));
  }

  return jsonOk(result);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  return jsonOk(await deleteWork(id));
}
