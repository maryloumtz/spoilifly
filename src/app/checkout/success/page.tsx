import { Suspense } from "react";
import CheckoutSuccessView from "@/views/CheckoutSuccessView";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessView />
    </Suspense>
  );
}
