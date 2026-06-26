"use client";

import Link from "next/link";
import { useTokenBalance, formatTokens } from "@/hooks/useTokenBalance";
import { ENTRY_MIN_TOKENS, TICKER } from "@/lib/config";
import { AddressConnect } from "./AddressConnect";

export function SiteHeader() {
  const { balance, loading } = useTokenBalance();
  const eligible = (balance ?? 0) >= ENTRY_MIN_TOKENS;

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 backdrop-blur-xl bg-black/30">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 flex items-center justify-center shadow-[0_0_24px_-4px_rgba(200,59,255,0.7)]">
            <span className="text-xl">🎁</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-black tracking-[0.18em] text-white">
              MAGIC MYSTERY
            </div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
              On-Chain Drawing · Solana
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <Link href="/" className="hover:text-white transition">
            Live Draw
          </Link>
          <Link href="#prizes" className="hover:text-white transition">
            Prizes
          </Link>
          <Link href="#how" className="hover:text-white transition">
            How it works
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {balance != null && (
            <div
              className={`hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg border text-xs font-semibold ${
                eligible
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                  : "border-white/10 bg-white/5 text-white/60"
              }`}
            >
              <span className="opacity-70">${TICKER}</span>
              <span className="font-mono">
                {loading ? "…" : formatTokens(balance)}
              </span>
              {eligible && <span>✓</span>}
            </div>
          )}
          <AddressConnect compact />
        </div>
      </div>
    </header>
  );
}
