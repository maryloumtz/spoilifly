"use client";

import { AppProvider } from "@/viewmodels/useAppVM";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
