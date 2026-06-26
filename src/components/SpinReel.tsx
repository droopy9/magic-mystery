"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PRIZES, type Prize, prizePct } from "@/lib/config";

type Phase = "idle" | "spinning" | "settled";

const TILE_W = 168; // px
const TILE_GAP = 10;
const STRIP_LEN = 60; // total tiles rendered

export function SpinReel({
  prize,
  trigger,
  onSettled,
}: {
  prize: Prize | null;
  trigger: number; // increment to start spin
  onSettled?: (prize: Prize) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [offset, setOffset] = useState(0);
  const startedFor = useRef<number>(-1);
  const cancelRef = useRef<number[]>([]);

  // Build a long pseudo-random strip of prize tiles, with the winning prize
  // placed at a deterministic index near the end.
  const { strip, winningIndex } = useMemo(() => {
    const arr: Prize[] = [];
    // Weighted random fill for the bulk of the strip
    for (let i = 0; i < STRIP_LEN; i++) {
      arr.push(PRIZES[i % PRIZES.length]);
    }
    // Shuffle deterministically per trigger
    const seed = trigger || 1;
    const rng = mulberry32(seed);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Place the winning prize near the end
    const wIdx = STRIP_LEN - 8;
    if (prize) arr[wIdx] = prize;
    return { strip: arr, winningIndex: wIdx };
  }, [trigger, prize]);

  // Start spin whenever trigger changes and we have a prize
  useEffect(() => {
    if (!prize) return;
    if (trigger === startedFor.current) return;
    startedFor.current = trigger;

    // Step 1: switch phase so the transition style is rendered, offset stays 0.
    setPhase("spinning");
    setOffset(0);

    // Step 2: wait two animation frames for React to commit the new
    // `transition` CSS, then change the transform value. Without this gap
    // the browser may merge both DOM updates into one paint and skip the
    // animation entirely.
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        const viewportWidth =
          document.getElementById("spin-viewport")?.clientWidth ?? 800;
        const tileCenter = winningIndex * (TILE_W + TILE_GAP) + TILE_W / 2;
        const jitter = (Math.random() - 0.5) * (TILE_W * 0.4);
        const target = tileCenter - viewportWidth / 2 + jitter;
        setOffset(target);
      });
      cancelRef.current.push(raf2);
    });
    cancelRef.current.push(raf1);

    const dur = 6200;
    const tid = window.setTimeout(() => {
      setPhase("settled");
      onSettled?.(prize);
    }, dur + 100);

    return () => {
      window.clearTimeout(tid);
      cancelRef.current.forEach((r) => cancelAnimationFrame(r));
      cancelRef.current = [];
    };
  }, [trigger, prize, winningIndex, onSettled]);

  return (
    <div className="relative">
      {/* Cursor indicator */}
      <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-amber-300 via-fuchsia-400 to-cyan-300 z-20 shadow-[0_0_24px_4px_rgba(255,206,58,0.55)]">
        <div className="absolute -top-2 -left-2 w-5 h-5 rotate-45 bg-amber-300" />
        <div className="absolute -bottom-2 -left-2 w-5 h-5 rotate-45 bg-amber-300" />
      </div>

      {/* Edge fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0a0a14] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0a0a14] to-transparent z-10" />

      <div
        id="spin-viewport"
        className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-black/60 to-black/30 h-52 relative"
      >
        <div
          className="absolute inset-y-0 left-0 flex items-center"
          style={{
            transform: `translate3d(${-offset}px, 0, 0)`,
            transition:
              phase === "spinning"
                ? "transform 6.2s cubic-bezier(0.08, 0.82, 0.17, 1)"
                : "none",
            gap: `${TILE_GAP}px`,
            paddingLeft: 12,
            paddingRight: 12,
          }}
        >
          {strip.map((p, i) => (
            <ReelTile key={i} prize={p} />
          ))}
        </div>
      </div>

      {/* Status line */}
      <div className="mt-3 text-center text-xs tracking-widest text-white/40">
        {phase === "idle" && "AWAITING DRAW"}
        {phase === "spinning" && "🎰 SPINNING…"}
        {phase === "settled" && prize && (
          <span className="text-amber-300 font-bold">
            ✦ RESULT: {prize.label} ({prizePct(prize)} chance) ✦
          </span>
        )}
      </div>
    </div>
  );
}

function ReelTile({ prize }: { prize: Prize }) {
  return (
    <div
      className={`shrink-0 rounded-xl bg-gradient-to-br ${prize.accent} p-[2px] shadow-lg`}
      style={{ width: TILE_W, height: 170 }}
    >
      <div className="h-full w-full rounded-[10px] bg-[#0a0a14]/95 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 shine opacity-40" />
        <div className="text-4xl floaty">
          {prize.rarity === "mythic"
            ? "💎"
            : prize.rarity === "legendary"
              ? "👑"
              : prize.rarity === "epic"
                ? "🎁"
                : prize.rarity === "rare"
                  ? "🎁"
                  : "📦"}
        </div>
        <div className="mt-2 text-sm font-black text-white">{prize.short}</div>
        <div className="text-[10px] tracking-widest text-white/40 uppercase mt-0.5">
          {prize.rarity}
        </div>
      </div>
    </div>
  );
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
