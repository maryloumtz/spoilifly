import { requireSessionUser } from "@/services/server/auth";
import { jsonError, jsonOk } from "@/services/server/http";
import { processSimulatedStripePayment } from "@/services/server/checkout";

function normalizeFieldErrors(errors?: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(errors ?? {}).filter((entry): entry is [string, string] => Boolean(entry[1])));
}

export async function POST(request: Request) {
  const auth = await requireSessionUser();
  if ("error" in auth) {
    return auth.error;
  }

  const result = await processSimulatedStripePayment(auth.user, await request.json());
  if ("error" in result) {
    return jsonError("Paiement refusé.", 400, normalizeFieldErrors(result.error));
  }

  return jsonOk(result);
}
