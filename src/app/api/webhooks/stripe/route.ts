import { createHmac, timingSafeEqual } from "node:crypto";
import { confirmCheckoutSession } from "@/services/server/checkout";
import { jsonError, jsonOk } from "@/services/server/http";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "spoilifly-webhook-secret";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-spoilifly-signature");

  if (!signature) {
    return jsonError("Signature manquante.", 401);
  }

  const expected = createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  const received = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (received.length !== expectedBuffer.length || !timingSafeEqual(received, expectedBuffer)) {
    return jsonError("Signature invalide.", 401);
  }

  const body = JSON.parse(rawBody) as { type?: string; data?: { sessionId?: string; userId?: string } };

  if (body.type !== "checkout.session.completed" || !body.data?.sessionId || !body.data.userId) {
    return jsonError("Payload webhook invalide.", 400);
  }

  const result = await confirmCheckoutSession(body.data.sessionId as string, body.data.userId as string);
  if ("error" in result) {
    return jsonError(result.error as string, 400);
  }

  return jsonOk({ received: true });
}
