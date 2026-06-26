"use client";

import type { Prize } from "@/lib/config";
import { prizePct } from "@/lib/config";

const rarityRing: Record<Prize["rarity"], string> = {
  common: "ring-zinc-400/30",
  rare: "ring-emerald-400/40",
  epic: "ring-fuchsia-400/50",
  legendary: "ring-amber-400/60",
  mythic: "ring-yellow-300/80",
};

const rarityLabel: Record<Prize["rarity"], string> = {
  common: "COMMON",
  rare: "RARE",
  epic: "EPIC",
  legendary: "LEGENDARY",
  mythic: "MYTHIC",
};

export function MysteryBoxCard({
  prize,
  locked = true,
  size = "md",
}: {
  prize: Prize;
  locked?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "lg"
      ? "h-56"
      : size === "sm"
        ? "h-28"
        : "h-40";

  return (
    <div
      className={`relative ${dims} rounded-2xl ring-1 ${rarityRing[prize.rarity]} overflow-hidden group bg-gradient-to-br ${prize.accent} shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)]`}
    >
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 shine opacity-60" />

      {/* Top labels */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold tracking-widest">
        <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-white/80">
          {rarityLabel[prize.rarity]}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur text-white/70">
          {prizePct(prize)}
        </span>
      </div>

      {/* Box illustration */}
      <div className="absolute inset-0 flex items-center justify-center">
        <BoxArt rarity={prize.rarity} locked={locked} size={size} />
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <div className="text-[10px] uppercase tracking-widest text-white/50">
          Prize Tier
        </div>
        <div className="text-sm font-black text-white leading-tight truncate">
          {prize.label}
        </div>
      </div>

      {locked && (
        <div className="absolute top-1/2 right-2 -translate-y-1/2 text-white/80 text-lg">
          🔒
        </div>
      )}
    </div>
  );
}

function BoxArt({
  rarity,
  locked,
  size,
}: {
  rarity: Prize["rarity"];
  locked: boolean;
  size: "sm" | "md" | "lg";
}) {
  const boxSize =
    size === "lg" ? "text-7xl" : size === "sm" ? "text-3xl" : "text-5xl";
  const emoji =
    rarity === "mythic"
      ? "💎"
      : rarity === "legendary"
        ? "👑"
        : rarity === "epic"
          ? "🎁"
          : rarity === "rare"
            ? "🎁"
            : "📦";
  return (
    <div className={`${boxSize} floaty drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] ${locked ? "grayscale-[20%]" : ""}`}>
      {emoji}
    </div>
  );
}
