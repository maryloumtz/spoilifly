import { Suspense } from "react";
import CheckoutSimulationView from "@/views/CheckoutSimulationView";

export default function CheckoutSimulationPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSimulationView />
    </Suspense>
  );
}
