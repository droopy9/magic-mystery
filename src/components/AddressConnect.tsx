"use client";

import { useState } from "react";
import { isValidSolanaAddress, useAddress } from "./AddressContext";

export function AddressConnect({ compact = false }: { compact?: boolean }) {
  const { address, setAddress, clear } = useAddress();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [err, setErr] = useState<string | null>(null);

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 h-11 flex items-center rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-200 font-mono text-sm">
          {shorten(address)}
        </div>
        <button
          onClick={clear}
          className="h-11 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 text-sm"
          title="Disconnect address"
        >
          ✕
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`${compact ? "h-11 px-5" : "h-12 px-7"} rounded-xl font-bold tracking-wide bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:brightness-110 text-white shadow-[0_10px_30px_-10px_rgba(200,59,255,0.6)]`}
      >
        Enter Public Key
      </button>
    );
  }

  const submit = () => {
    const v = input.trim();
    if (!isValidSolanaAddress(v)) {
      setErr("Not a valid Solana public key");
      return;
    }
    setErr(null);
    setAddress(v);
    setOpen(false);
    setInput("");
  };

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setErr(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") {
            setOpen(false);
            setInput("");
            setErr(null);
          }
        }}
        placeholder="Paste Solana public key…"
        className={`h-11 w-72 md:w-96 px-3 rounded-xl bg-black/60 border ${err ? "border-rose-400/60" : "border-white/15"} text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-violet-400/60`}
      />
      <button
        onClick={submit}
        className="h-11 px-4 rounded-xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:brightness-110"
      >
        Verify
      </button>
      {err && (
        <span className="text-rose-300 text-xs hidden md:inline">{err}</span>
      )}
    </div>
  );
}

function shorten(a: string) {
  return a.length <= 12 ? a : `${a.slice(0, 4)}…${a.slice(-4)}`;
}
