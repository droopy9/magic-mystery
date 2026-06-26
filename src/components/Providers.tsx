"use client";

import { type ReactNode } from "react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { RPC_ENDPOINT } from "@/lib/config";
import { AddressProvider } from "./AddressContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <AddressProvider>{children}</AddressProvider>
    </ConnectionProvider>
  );
}
