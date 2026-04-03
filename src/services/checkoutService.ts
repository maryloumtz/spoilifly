import type { SimulatedPaymentInput } from "@/models/forms";
import { apiSend } from "@/services/apiClient";

export interface CheckoutItemPayload {
  productType: "spoil" | "pack";
  productId: string;
}

export function createCheckout(items: CheckoutItemPayload[]) {
  return apiSend<{ sessionId: string; checkoutUrl: string }>("/api/checkout", "POST", { items });
}

export function confirmCheckout(sessionId: string) {
  return apiSend<{ ok: true }>("/api/checkout/confirm", "POST", { sessionId });
}

export function paySimulatedStripe(payload: SimulatedPaymentInput) {
  return apiSend<{ ok: true; sessionId: string; signature: string }>("/api/checkout/pay", "POST", payload);
}
