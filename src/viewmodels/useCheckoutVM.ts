"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SimulatedPaymentInput } from "@/models/forms";
import { ApiClientError } from "@/services/apiClient";
import { createCheckout, paySimulatedStripe } from "@/services/checkoutService";
import { useAppVM } from "@/viewmodels/useAppVM";

export function useCheckoutVM() {
  const router = useRouter();
  const { cart, clearCart } = useAppVM();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  async function startCheckout() {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await createCheckout(
        cart.map((item) => ({ productType: item.productType, productId: item.productId })),
      );
      router.push(response.checkoutUrl);
    } catch (error) {
      setError(error instanceof ApiClientError ? error.message : "Impossible de lancer le paiement.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function completeCheckout(payload: SimulatedPaymentInput) {
    setIsPaying(true);
    setError(null);
    try {
      await paySimulatedStripe(payload);
      clearCart();
    } catch (error) {
      setError(error instanceof ApiClientError ? error.message : "Confirmation du paiement impossible.");
    } finally {
      setIsPaying(false);
    }
  }

  return { startCheckout, completeCheckout, isSubmitting, isPaying, error };
}
