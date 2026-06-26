"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAddress } from "./AddressContext";
import { Countdown } from "./Countdown";
import { EntrantsList, type Entrant } from "./EntrantsList";
import { SpinReel } from "./SpinReel";
import { Hero } from "./Hero";
import { MysteryBoxCard } from "./MysteryBoxCard";
import {
  DEMO_WINNER_ADDRESS,
  ENTRY_MIN_TOKENS,
  PRIZES,
  pickPrize,
  prizePct,
  type Prize,
} from "@/lib/config";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { formatNumber } from "@/lib/format";

type Stage = "open" | "drawing" | "won" | "opening" | "revealed";

const DRAW_DURATION_MS = 60_000; // 60-second countdown per draw

export function DrawArena() {
  const { address } = useAddress();
  const { balance } = useTokenBalance();
  const eligible = (balance ?? 0) >= ENTRY_MIN_TOKENS;
  const me = address;
  const connected = !!address;

  // All random / time-based state is initialized after mount to avoid SSR/CSR
  // hydration mismatches. We render a small placeholder until then.
  const [mounted, setMounted] = useState(false);
  const [drawId, setDrawId] = useState("000000");
  const [endsAt, setEndsAt] = useState<number>(0);
  const [stage, setStage] = useState<Stage>("open");
  const [entrants, setEntrants] = useState<Entrant[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [prize, setPrize] = useState<Prize | null>(null);
  const [spinTrigger, setSpinTrigger] = useState(0);
  const meEntered = !!entrants.find((e) => e.address === me);

  useEffect(() => {
    setDrawId(Math.floor(100000 + Math.random() * 899999).toString());
    setEndsAt(Date.now() + DRAW_DURATION_MS);
    setEntrants(seedEntrants(7));
    setMounted(true);
  }, []);

  // Trickle in fake entrants over time to give the page life
  useEffect(() => {
    if (!mounted) return;
    if (stage !== "open") return;
    const id = setInterval(() => {
      setEntrants((prev) => {
        if (prev.length >= 24) return prev;
        return [...prev, randomEntrant()];
      });
    }, 4500);
    return () => clearInterval(id);
  }, [stage, mounted]);

  const onEnter = useCallback(() => {
    if (!me || !eligible || meEntered) return;
    setEntrants((prev) => [
      ...prev,
      { address: me, joinedAt: Date.now(), balance: balance ?? 0, self: true },
    ]);
  }, [me, eligible, meEntered, balance]);

  // Once the countdown ends, pick a winner from the entrants pool
  const drewRef = useRef(false);
  const onCountdownComplete = useCallback(() => {
    if (drewRef.current) return;
    drewRef.current = true;
    setStage("drawing");
    // Drum-roll: cycle entrant highlight quickly, then settle
    let idx = 0;
    const start = Date.now();
    const id = setInterval(() => {
      idx = (idx + 1) % Math.max(entrants.length, 1);
      setWinner(entrants[idx]?.address ?? null);
      if (Date.now() - start > 4500) {
        clearInterval(id);
        // Demo override: if the demo address is among entrants, force it to win.
        const demo = entrants.find((e) => e.address === DEMO_WINNER_ADDRESS);
        const w =
          demo ?? entrants[Math.floor(Math.random() * entrants.length)];
        setWinner(w?.address ?? null);
        setStage("won");
      }
    }, 120);
  }, [entrants]);

  const onOpenBox = useCallback(() => {
    if (stage !== "won") return;
    const p = pickPrize();
    setPrize(p);
    setStage("opening");
    setSpinTrigger((n) => n + 1);
    // Scroll the reel into view so the spin is visible even if the user
    // had scrolled away while the countdown ran.
    setTimeout(() => {
      document
        .getElementById("spin-viewport")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }, [stage]);

  const onSpinSettled = useCallback(() => {
    setStage("revealed");
  }, []);

  const startNewDraw = useCallback(() => {
    drewRef.current = false;
    setStage("open");
    setWinner(null);
    setPrize(null);
    setEntrants(seedEntrants(6));
    setEndsAt(Date.now() + DRAW_DURATION_MS);
  }, []);

  const isWinnerMe = winner && me && winner === me;

  return (
    <>
      <DemoBanner />
      <Hero onEnter={onEnter} isEntered={meEntered} drawId={drawId} />

      {/* Arena */}
      <section className="mx-auto max-w-7xl px-6 mt-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur p-6 md:p-8 shadow-[0_30px_80px_-30px_rgba(123,63,255,0.4)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-[11px] tracking-[0.3em] text-white/40">
                LIVE DRAW · #{drawId}
              </div>
              <div className="mt-1 text-2xl font-black text-white">
                {stage === "open" && "Entries close in"}
                {stage === "drawing" && "Selecting winner on-chain…"}
                {stage === "won" && (isWinnerMe ? "🎉 You won — open the box!" : "Winner selected")}
                {stage === "opening" && "Opening mystery box…"}
                {stage === "revealed" && "Reward delivered"}
              </div>
            </div>
            {stage === "open" && mounted && endsAt > 0 && (
              <Countdown endsAt={endsAt} onComplete={onCountdownComplete} />
            )}
            {stage === "revealed" && (
              <button
                onClick={startNewDraw}
                className="h-11 px-5 rounded-xl font-bold tracking-wide bg-white/10 hover:bg-white/15 border border-white/15 text-white"
              >
                Start new draw →
              </button>
            )}
          </div>

          {/* Two-column layout: reel/box + entrants */}
          <div className="mt-6 grid lg:grid-cols-[1.6fr_1fr] gap-6">
            <div>
              {/* Closed-box state */}
              {(stage === "open" || stage === "drawing") && (
                <ClosedBoxArt drawing={stage === "drawing"} />
              )}

              {stage === "won" && (
                <WinnerCallout
                  isMe={!!isWinnerMe}
                  winner={winner}
                  onOpen={onOpenBox}
                  connected={connected}
                />
              )}

              {(stage === "opening" || stage === "revealed") && (
                <SpinReel
                  prize={prize}
                  trigger={spinTrigger}
                  onSettled={onSpinSettled}
                />
              )}

              {stage === "revealed" && prize && (
                <RewardCard prize={prize} winnerIsMe={!!isWinnerMe} winner={winner} />
              )}
            </div>

            <EntrantsList entrants={entrants} winner={winner} />
          </div>
        </div>
      </section>

      <PrizesSection />
      <HowItWorks />
    </>
  );
}

function DemoBanner() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(DEMO_WINNER_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="bg-amber-300/10 border-b border-amber-300/20 text-amber-100">
      <div className="mx-auto max-w-7xl px-6 py-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="font-bold tracking-widest text-amber-300">
          DEMO MODE
        </span>
        <span className="text-amber-100/80">
          Use this address to skip the balance check and always win:
        </span>
        <code className="font-mono bg-black/40 px-2 py-0.5 rounded text-amber-200 break-all">
          {DEMO_WINNER_ADDRESS}
        </code>
        <button
          onClick={copy}
          className="ml-auto px-2 py-0.5 rounded bg-amber-300 text-black font-bold hover:brightness-110"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function ClosedBoxArt({ drawing }: { drawing: boolean }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-black/60 to-black/30 h-72 overflow-hidden flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,59,255,0.18),transparent_60%)]" />
      <div className="absolute inset-0 shine opacity-40" />
      <div className="relative z-10 text-center">
        <div className="text-8xl floaty">{drawing ? "🎲" : "🎁"}</div>
        <div className="mt-4 text-xs tracking-[0.3em] text-white/50">
          {drawing ? "SELECTING WINNER" : "BOX LOCKED · AWAITING WINNER"}
        </div>
        {!drawing && (
          <div className="mt-2 text-[11px] text-white/30">
            Only the chosen wallet can open this box
          </div>
        )}
      </div>
      {!drawing && (
        <div className="absolute top-4 right-4 text-3xl">🔒</div>
      )}
    </div>
  );
}

function WinnerCallout({
  isMe,
  winner,
  onOpen,
  connected,
}: {
  isMe: boolean;
  winner: string | null;
  onOpen: () => void;
  connected: boolean;
}) {
  return (
    <div className="relative rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-400/10 via-fuchsia-500/10 to-violet-500/10 h-72 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 shine opacity-50" />
      <div className="relative z-10 text-center px-6">
        <div className="text-[10px] tracking-[0.3em] text-amber-300 font-bold">
          WINNER SELECTED
        </div>
        <div className="mt-2 text-2xl font-black text-white font-mono break-all">
          {winner ? shorten(winner) : "—"}
        </div>
        {isMe ? (
          <>
            <p className="mt-3 text-sm text-white/70">
              Your wallet is the chosen one. Press <b className="text-amber-300">DRAW</b> to open the box and receive your reward.
            </p>
            <button
              onClick={onOpen}
              className="mt-5 h-12 px-8 rounded-xl font-black tracking-wide bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-black hover:brightness-110 shadow-[0_10px_40px_-10px_rgba(255,206,58,0.7)] pulse-gold"
            >
              🎁 DRAW & OPEN BOX
            </button>
          </>
        ) : (
          <p className="mt-4 text-sm text-white/60 max-w-md mx-auto">
            {connected
              ? "Not your wallet this time. Watch the box open live — the next draw starts soon."
              : "Watching as a spectator. Connect a wallet and hold $MYSTIC to be eligible next round."}
          </p>
        )}
      </div>
    </div>
  );
}

function RewardCard({
  prize,
  winnerIsMe,
  winner,
}: {
  prize: Prize;
  winnerIsMe: boolean;
  winner: string | null;
}) {
  return (
    <div
      className={`mt-6 rounded-2xl border border-white/10 p-5 bg-gradient-to-br ${prize.accent}/10`}
    >
      <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center">
        <div>
          <div className="text-[11px] tracking-[0.3em] text-white/50">
            DELIVERED TO
          </div>
          <div className="mt-1 font-mono text-white break-all">
            {winner ? shorten(winner, 8) : "—"}
          </div>
          <div className="mt-3 text-lg font-black text-white">
            🏆 {prize.label}
          </div>
          <div className="text-xs text-white/60 mt-1">
            Tier: {prize.rarity.toUpperCase()} · Drop rate {prizePct(prize)}
          </div>
          {winnerIsMe && (
            <div className="mt-2 text-xs text-emerald-300">
              ✓ Transferred on-chain to your wallet
            </div>
          )}
        </div>
        <div className="hidden sm:block">
          <MysteryBoxCard prize={prize} locked={false} size="md" />
        </div>
      </div>
    </div>
  );
}

function PrizesSection() {
  return (
    <section id="prizes" className="mx-auto max-w-7xl px-6 mt-20">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-[11px] tracking-[0.3em] text-white/40">
            PRIZE VAULT
          </div>
          <h2 className="text-3xl font-black text-white">Mystery Box Tiers</h2>
          <p className="text-white/60 mt-1 text-sm">
            Weighted drop rates — verifiable on-chain via VRF.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {PRIZES.map((p) => (
          <MysteryBoxCard key={p.id} prize={p} locked />
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Hold $MYSTIC",
      body: `Connect your Solana wallet. Need at least ${formatNumber(ENTRY_MIN_TOKENS)} $MYSTIC to be eligible.`,
      icon: "💼",
    },
    {
      n: "02",
      title: "Enter the draw",
      body: "Press ENTER. Your public key is added to the on-chain entrants list for the active round.",
      icon: "🎫",
    },
    {
      n: "03",
      title: "Countdown",
      body: "When the timer hits zero, a VRF call selects one winner. Everyone watches it live.",
      icon: "⏱️",
    },
    {
      n: "04",
      title: "Open the box",
      body: "Only the chosen wallet can press DRAW. The reel spins, the prize lands, payout is atomic.",
      icon: "🎁",
    },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-6 mt-20">
      <div className="text-[11px] tracking-[0.3em] text-white/40">
        HOW IT WORKS
      </div>
      <h2 className="text-3xl font-black text-white">Four steps. Fully on-chain.</h2>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div className="text-3xl">{s.icon}</div>
              <div className="text-xs font-mono text-white/40">{s.n}</div>
            </div>
            <div className="mt-3 text-lg font-bold text-white">{s.title}</div>
            <p className="text-sm text-white/60 mt-1">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function shorten(addr: string, len = 4) {
  return addr.length <= len * 2 + 2 ? addr : `${addr.slice(0, len)}…${addr.slice(-len)}`;
}

function seedEntrants(n: number): Entrant[] {
  return Array.from({ length: n }, (_, i) => randomEntrant(i * 8000));
}

function randomEntrant(ageMs = 0): Entrant {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
  let s = "";
  for (let i = 0; i < 44; i++) s += chars[Math.floor(Math.random() * chars.length)];
  const bal = 100_000 + Math.floor(Math.random() * 2_500_000);
  return { address: s, joinedAt: Date.now() - ageMs, balance: bal };
}
