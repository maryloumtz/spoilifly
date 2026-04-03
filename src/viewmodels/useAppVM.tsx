"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { SessionUser } from "@/models/domain";
import { fetchSession, logout } from "@/services/authService";
import { ApiClientError } from "@/services/apiClient";

export interface CartItem {
  id: string;
  productType: "spoil" | "pack";
  productId: string;
  title: string;
  workTitle: string;
  priceCents: number;
}

interface AppContextValue {
  sessionUser: SessionUser | null;
  isSessionLoading: boolean;
  cart: CartItem[];
  cartCount: number;
  cartTotalCents: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  refreshSession: () => Promise<void>;
  setSessionUser: (user: SessionUser | null) => void;
  logoutUser: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);
const CART_STORAGE_KEY = "spoilifly-cart";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored) as CartItem[]);
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  async function refreshSession() {
    setIsSessionLoading(true);
    try {
      const data = await fetchSession();
      setSessionUser(data.user);
    } catch (error) {
      if (!(error instanceof ApiClientError)) {
        throw error;
      }
      setSessionUser(null);
    } finally {
      setIsSessionLoading(false);
    }
  }

  useEffect(() => {
    void refreshSession();
  }, []);

  async function logoutUser() {
    await logout();
    setSessionUser(null);
  }

  function addToCart(item: CartItem) {
    setCart((current) => {
      if (current.some((entry) => entry.productType === item.productType && entry.productId === item.productId)) {
        return current;
      }
      return [...current, item];
    });
  }

  function removeFromCart(id: string) {
    setCart((current) => current.filter((entry) => entry.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  const value = useMemo<AppContextValue>(
    () => ({
      sessionUser,
      isSessionLoading,
      cart,
      cartCount: cart.length,
      cartTotalCents: cart.reduce((sum, entry) => sum + entry.priceCents, 0),
      addToCart,
      removeFromCart,
      clearCart,
      refreshSession,
      setSessionUser,
      logoutUser,
    }),
    [cart, isSessionLoading, sessionUser],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppVM() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppVM must be used within AppProvider");
  }

  return context;
}
