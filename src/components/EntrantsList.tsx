"use client";

import { formatNumber } from "@/lib/format";

export type Entrant = {
  address: string;
  joinedAt: number;
  balance: number;
  self?: boolean;
};

export function EntrantsList({
  entrants,
  winner,
}: {
  entrants: Entrant[];
  winner: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-white/80">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          ENTRANTS
        </div>
        <div className="text-xs font-mono text-white/50">
          {entrants.length} wallets
        </div>
      </div>
      <ul className="divide-y divide-white/5 max-h-[420px] overflow-auto scrollbar-none">
        {entrants.length === 0 && (
          <li className="px-4 py-8 text-center text-white/40 text-sm">
            No entrants yet — be the first.
          </li>
        )}
        {entrants.map((e) => {
          const isWinner = winner === e.address;
          return (
            <li
              key={e.address}
              className={`px-4 py-3 flex items-center justify-between text-sm transition ${
                isWinner
                  ? "bg-gradient-to-r from-amber-400/20 via-yellow-400/10 to-transparent"
                  : ""
              } ${e.self ? "bg-violet-500/5" : ""}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar seed={e.address} winner={isWinner} />
                <div className="min-w-0">
                  <div className="font-mono text-white/90 truncate">
                    {shorten(e.address)}
                    {e.self && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-violet-500/30 text-violet-200">
                        YOU
                      </span>
                    )}
                    {isWinner && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-black font-black">
                        WINNER
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/40">
                    {formatNumber(e.balance)} $MYSTIC
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-white/40 tabular-nums">
                {timeAgo(e.joinedAt)}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function shorten(addr: string) {
  return addr.length <= 12 ? addr : `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function timeAgo(t: number) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

function Avatar({ seed, winner }: { seed: string; winner: boolean }) {
  const hash = Array.from(seed).reduce(
    (a, c) => (a * 31 + c.charCodeAt(0)) >>> 0,
    7,
  );
  const h1 = hash % 360;
  const h2 = (hash >> 8) % 360;
  return (
    <div
      className={`h-8 w-8 rounded-lg flex-shrink-0 ${winner ? "ring-2 ring-amber-300" : ""}`}
      style={{
        background: `linear-gradient(135deg, hsl(${h1} 80% 55%), hsl(${h2} 80% 45%))`,
      }}
    />
  );
}
