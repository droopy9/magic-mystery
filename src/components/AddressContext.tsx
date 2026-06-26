"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PublicKey } from "@solana/web3.js";

type Ctx = {
  address: string | null;
  setAddress: (a: string) => void;
  clear: () => void;
};

const AddressCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "mm.address";

export function AddressProvider({ children }: { children: ReactNode }) {
  const [address, setAddressState] = useState<string | null>(null);

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && isValidSolanaAddress(saved)) setAddressState(saved);
    } catch {}
  }, []);

  const setAddress = useCallback((a: string) => {
    const trimmed = a.trim();
    if (!isValidSolanaAddress(trimmed)) return;
    setAddressState(trimmed);
    try {
      window.localStorage.setItem(STORAGE_KEY, trimmed);
    } catch {}
  }, []);

  const clear = useCallback(() => {
    setAddressState(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const value = useMemo(
    () => ({ address, setAddress, clear }),
    [address, setAddress, clear],
  );

  return <AddressCtx.Provider value={value}>{children}</AddressCtx.Provider>;
}

export function useAddress(): Ctx {
  const ctx = useContext(AddressCtx);
  if (!ctx) throw new Error("useAddress must be used inside AddressProvider");
  return ctx;
}

export function isValidSolanaAddress(s: string): boolean {
  if (!s || s.length < 32 || s.length > 44) return false;
  try {
    const pk = new PublicKey(s);
    // PublicKey constructor is lenient; check round-trip
    return pk.toBase58() === s;
  } catch {
    return false;
  }
}
