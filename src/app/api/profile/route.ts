import { getSessionUser, updateCurrentProfile } from "@/services/server/auth";
import { getPurchaseHistory } from "@/services/server/catalog";
import { readDatabase } from "@/services/server/db";
import { jsonError, jsonOk } from "@/services/server/http";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("Authentification requise.", 401);
  }

  const purchases = await getPurchaseHistory(user.id);
  const db = await readDatabase();
  const profile = db.profiles.find((entry) => entry.userId === user.id);
  return jsonOk({ user, bio: profile?.bio ?? "", purchases });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("Authentification requise.", 401);
  }

  const body = (await request.json()) as {
    displayName?: string;
    email?: string;
    bio?: string;
    avatarUrl?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  const result = await updateCurrentProfile(user.id, {
    displayName: body.displayName ?? "",
    email: body.email ?? "",
    bio: body.bio ?? "",
    avatarUrl: body.avatarUrl ?? "",
    currentPassword: body.currentPassword ?? "",
    newPassword: body.newPassword ?? "",
  });

  if (result.error) {
    return jsonError("Mise à jour impossible.", 400, result.error);
  }

  return jsonOk({ user: result.user });
}
