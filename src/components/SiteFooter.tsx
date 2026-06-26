export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-6 md:grid-cols-3 text-sm text-white/50">
        <div>
          <div className="text-white font-black tracking-widest mb-2">
            MAGIC MYSTERY
          </div>
          <p>
            A fully on-chain mystery box drawing for holders of $MYSTIC.
            Provably fair, live for everyone — claimable only by the winner.
          </p>
        </div>
        <div>
          <div className="text-white/80 font-semibold mb-2">Protocol</div>
          <ul className="space-y-1">
            <li>Solana · SPL-Token gated</li>
            <li>VRF-backed winner selection</li>
            <li>Atomic on-chain payout</li>
          </ul>
        </div>
        <div>
          <div className="text-white/80 font-semibold mb-2">Disclaimer</div>
          <p>
            Crypto involves risk. Do not participate if prohibited in your
            jurisdiction. Past draws do not affect future probabilities.
          </p>
        </div>
      </div>
      <div className="text-center text-xs text-white/30 pb-8">
        © {new Date().getFullYear()} Magic Mystery
      </div>
    </footer>
  );
}
