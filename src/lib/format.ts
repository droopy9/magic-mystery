// Locale-stable number formatter — avoids SSR/CSR hydration mismatches
// caused by .toLocaleString() picking up the request locale on the server
// and the browser locale on the client.
const nf = new Intl.NumberFormat("en-US");

export function formatNumber(n: number): string {
  return nf.format(n);
}
