"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { MYSTIC_DECIMALS, MYSTIC_MINT } from "@/lib/config";
import { useAddress } from "@/components/AddressContext";

type State = {
  balance: number | null;
  loading: boolean;
  error: string | null;
};

export function useTokenBalance(): State {
  const { connection } = useConnection();
  const { address } = useAddress();
  const [state, setState] = useState<State>({
    balance: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    if (!address) {
      setState({ balance: null, loading: false, error: null });
      return;
    }
    setState({ balance: null, loading: true, error: null });

    (async () => {
      try {
        const owner = new PublicKey(address);
        const mint = new PublicKey(MYSTIC_MINT);
        const resp = await connection.getParsedTokenAccountsByOwner(owner, {
          mint,
        });
        let total = 0;
        for (const acc of resp.value) {
          const info = acc.account.data.parsed.info;
          const amt = Number(info.tokenAmount.uiAmount ?? 0);
          total += amt;
        }
        if (!cancelled) setState({ balance: total, loading: false, error: null });
      } catch (err) {
        if (cancelled) return;
        setState({
          balance: 0,
          loading: false,
          error:
            err instanceof Error ? err.message : "Failed to fetch balance",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [connection, address]);

  return state;
}

export function formatTokens(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toFixed(MYSTIC_DECIMALS > 0 ? 2 : 0);
}
