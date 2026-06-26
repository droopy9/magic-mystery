"use client";

import { useEffect, useState } from "react";

export function Countdown({
  endsAt,
  onComplete,
}: {
  endsAt: number;
  onComplete?: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, endsAt - now);
  const total = Math.floor(remaining / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  const ms = Math.floor((remaining % 1000) / 10);

  useEffect(() => {
    if (remaining <= 0) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining <= 0]);

  return (
    <div className="flex items-center gap-2 font-mono font-black">
      <Cell value={m.toString().padStart(2, "0")} label="MIN" />
      <Sep />
      <Cell value={s.toString().padStart(2, "0")} label="SEC" />
      <Sep />
      <Cell value={ms.toString().padStart(2, "0")} label="MS" small />
    </div>
  );
}

function Cell({
  value,
  label,
  small,
}: {
  value: string;
  label: string;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`rounded-lg bg-black/60 border border-white/10 px-3 py-2 tabular-nums ${
          small ? "text-xl text-white/60 min-w-[3rem]" : "text-3xl md:text-4xl text-white min-w-[4rem]"
        } text-center`}
      >
        {value}
      </div>
      <div className="text-[9px] tracking-[0.3em] text-white/40 mt-1">
        {label}
      </div>
    </div>
  );
}

function Sep() {
  return <div className="text-2xl text-white/30 -mt-4">:</div>;
}
