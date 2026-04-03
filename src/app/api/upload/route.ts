import { promises as fs } from "node:fs";
import path from "node:path";
import { createMedia } from "@/services/server/admin";
import { requireAdminUser } from "@/services/server/auth";
import { jsonError, jsonOk } from "@/services/server/http";
import { createId } from "@/services/server/utils";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"];

export async function POST(request: Request) {
  const auth = await requireAdminUser();
  if ("error" in auth) {
    return auth.error;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const ownerType = formData.get("ownerType");
  const ownerId = formData.get("ownerId");
  const alt = String(formData.get("alt") ?? "");

  if (!(file instanceof File) || typeof ownerType !== "string" || typeof ownerId !== "string") {
    return jsonError("Payload upload invalide.", 400);
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return jsonError("Type de fichier non autorisé.", 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonError("Fichier trop volumineux (8 MB max).", 400);
  }

  const bytes = await file.arrayBuffer();
  const extension = file.name.split(".").pop() || "bin";
  const fileName = `${createId("upload")}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));

  const mediaResult = await createMedia({
    ownerType: ownerType === "work" ? "work" : "spoil",
    ownerId,
    kind: file.type.startsWith("video/") ? "video" : "image",
    url: `/uploads/${fileName}`,
    alt,
  });

  return jsonOk(mediaResult);
}
