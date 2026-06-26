"use client";

import { useTokenBalance, formatTokens } from "@/hooks/useTokenBalance";
import { ENTRY_MIN_TOKENS, TICKER } from "@/lib/config";
import { useAddress } from "./AddressContext";
import { AddressConnect } from "./AddressConnect";

export function Hero({
  onEnter,
  isEntered,
  drawId,
}: {
  onEnter: () => void;
  isEntered: boolean;
  drawId: string;
}) {
  const { address } = useAddress();
  const { balance, loading } = useTokenBalance();
  const eligible = (balance ?? 0) >= ENTRY_MIN_TOKENS;

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          {/* Left: pitch */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Draw <span className="font-mono opacity-60">#{drawId}</span>
            </div>

            <h1 className="mt-5 text-5xl md:text-6xl font-black tracking-tight leading-[1.05]">
              Hold the coin.
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                Unlock the box.
              </span>
            </h1>
            <p className="mt-5 text-lg text-white/70 max-w-xl">
              Every draw, one wallet is chosen on-chain. The winner opens a
              mystery box and instantly receives a share of creator rewards —
              or the <span className="text-amber-300 font-semibold">5 SOL grand jackpot</span>.
              Paste a Solana public key that holds at least{" "}
              <span className="text-white font-semibold">
                {ENTRY_MIN_TOKENS.toLocaleString()} ${TICKER}
              </span>{" "}
              to enter.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {!address ? (
                <AddressConnect />
              ) : eligible ? (
                <button
                  onClick={onEnter}
                  disabled={isEntered}
                  className="h-12 px-7 rounded-xl font-bold tracking-wide bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-black hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_10px_40px_-10px_rgba(255,206,58,0.7)]"
                >
                  {isEntered ? "✓ ENTERED" : "ENTER DRAW"}
                </button>
              ) : (
                <button
                  disabled
                  className="h-12 px-7 rounded-xl font-bold tracking-wide bg-white/5 border border-white/10 text-white/60 cursor-not-allowed"
                >
                  Need {ENTRY_MIN_TOKENS.toLocaleString()} ${TICKER}
                </button>
              )}
              <a
                href="#prizes"
                className="h-12 px-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center font-semibold text-white/80"
              >
                See prizes
              </a>
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-3 max-w-md">
              <Stat label="Your balance" value={loading ? "…" : formatTokens(balance)} />
              <Stat
                label="Eligibility"
                value={eligible ? "✓ Eligible" : address ? "Below min" : "—"}
                tone={eligible ? "good" : "muted"}
              />
              <Stat label="Min entry" value={`${(ENTRY_MIN_TOKENS / 1000).toFixed(0)}K`} />
            </dl>
          </div>

          {/* Right: stacked locked boxes preview */}
          <div className="relative">
            <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(200,59,255,0.25),transparent_60%)] blur-2xl" />
            <FeatureBoxStack />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "muted";
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-white/40">
        {label}
      </div>
      <div
        className={`text-base font-bold font-mono ${
          tone === "good"
            ? "text-emerald-300"
            : tone === "muted"
              ? "text-white/50"
              : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function FeatureBoxStack() {
  return (
    <div className="relative h-[420px]">
      {/* Big center box */}
      <div className="absolute inset-x-8 top-6 bottom-6 rounded-3xl bg-gradient-to-br from-amber-400 via-fuchsia-500 to-violet-700 p-[2px] pulse-gold">
        <div className="h-full w-full rounded-3xl bg-[#0a0a14] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 shine opacity-50" />
          <div className="text-[10px] tracking-[0.3em] text-amber-300 font-bold">
            GRAND JACKPOT
          </div>
          <div className="text-7xl floaty mt-2">🎁</div>
          <div className="mt-4 text-3xl font-black bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
            5 SOL
          </div>
          <div className="text-xs text-white/40 mt-1">Mythic · 0.5% drop</div>
          <div className="absolute top-3 right-3 text-2xl">🔒</div>
        </div>
      </div>

      <SideBox className="left-0 top-8 rotate-[-8deg]"   emoji="👑" tier="100%" tint="from-amber-400 to-yellow-300" />
      <SideBox className="right-0 top-16 rotate-[10deg]" emoji="🎁" tier="70%"  tint="from-pink-500 to-rose-400" />
      <SideBox className="left-2 bottom-4 rotate-[6deg]" emoji="🎁" tier="50%"  tint="from-violet-500 to-fuchsia-400" />
      <SideBox className="right-2 bottom-0 rotate-[-6deg]" emoji="📦" tier="30%" tint="from-emerald-500 to-teal-300" />
    </div>
  );
}

function SideBox({
  className,
  emoji,
  tier,
  tint,
}: {
  className?: string;
  emoji: string;
  tier: string;
  tint: string;
}) {
  return (
    <div
      className={`absolute w-28 h-28 rounded-2xl bg-gradient-to-br ${tint} p-[2px] shadow-2xl ${className}`}
    >
      <div className="h-full w-full rounded-2xl bg-[#0a0a14]/95 flex flex-col items-center justify-center relative">
        <div className="text-3xl floaty">{emoji}</div>
        <div className="text-[10px] tracking-widest text-white/60 mt-1">
          {tier}
        </div>
        <div className="absolute top-1 right-1 text-xs">🔒</div>
      </div>
    </div>
  );
}
