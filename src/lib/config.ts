// Public config for the Magic Mystery drawing.
// Replace MYSTIC_MINT with your actual SPL token mint address.
export const MYSTIC_MINT =
  process.env.NEXT_PUBLIC_MYSTIC_MINT ??
  "So11111111111111111111111111111111111111112"; // placeholder = wSOL mint

export const MYSTIC_DECIMALS = Number(
  process.env.NEXT_PUBLIC_MYSTIC_DECIMALS ?? 6,
);

export const ENTRY_MIN_TOKENS = Number(
  process.env.NEXT_PUBLIC_ENTRY_MIN_TOKENS ?? 100_000,
);

export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC ??
  "https://api.mainnet-beta.solana.com";

export const TICKER = "MYSTIC";

// Demo mode: this address bypasses the on-chain balance check and is always
// forced to win the draw. Use for testing the full flow without real tokens.
// (It's the well-known wrapped-SOL mint address — a valid Solana pubkey.)
export const DEMO_WINNER_ADDRESS =
  "So11111111111111111111111111111111111111112";
export const DEMO_BALANCE = 500_000;

// Weighted prize table — sum of weights = 1000 for easy reasoning.
// rarity controls UI badge color.
export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
export type Prize = {
  id: string;
  label: string;
  short: string;
  weight: number; // out of 1000
  rarity: Rarity;
  accent: string;
};

export const PRIZES: Prize[] = [
  { id: "p10",   label: "10% of Creator Rewards",  short: "10%",  weight: 330, rarity: "common",    accent: "from-zinc-500 to-zinc-300" },
  { id: "p20",   label: "20% of Creator Rewards",  short: "20%",  weight: 250, rarity: "common",    accent: "from-sky-500 to-cyan-300" },
  { id: "p30",   label: "30% of Creator Rewards",  short: "30%",  weight: 180, rarity: "rare",      accent: "from-emerald-500 to-teal-300" },
  { id: "p50",   label: "50% of Creator Rewards",  short: "50%",  weight: 130, rarity: "epic",      accent: "from-violet-500 to-fuchsia-400" },
  { id: "p70",   label: "70% of Creator Rewards",  short: "70%",  weight:  70, rarity: "epic",      accent: "from-pink-500 to-rose-400" },
  { id: "p100",  label: "100% of Creator Rewards", short: "100%", weight:  35, rarity: "legendary", accent: "from-amber-500 to-yellow-300" },
  { id: "jp",    label: "GRAND JACKPOT · 5 SOL",   short: "5 SOL",weight:   5, rarity: "mythic",    accent: "from-yellow-400 via-amber-300 to-orange-400" },
];

export const TOTAL_WEIGHT = PRIZES.reduce((s, p) => s + p.weight, 0);

export function pickPrize(rng: () => number = Math.random): Prize {
  const roll = rng() * TOTAL_WEIGHT;
  let acc = 0;
  for (const p of PRIZES) {
    acc += p.weight;
    if (roll < acc) return p;
  }
  return PRIZES[0];
}

export function prizePct(p: Prize): string {
  return ((p.weight / TOTAL_WEIGHT) * 100).toFixed(p.weight < 10 ? 2 : 1) + "%";
}
