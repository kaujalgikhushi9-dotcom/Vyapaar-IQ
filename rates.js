// Live USD->INR reference rate (ECB data via Frankfurter, updated once per working day).
// If the API is unreachable we use FALLBACK_USD_INR and label it as a snapshot.
let cache = null;
const CACHE_MS = 10 * 60 * 1000;

async function getUsdInr() {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) return cache.value;
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 6000);
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=INR", { signal: ctl.signal });
    clearTimeout(t);
    const data = await res.json();
    if (data && data.rates && data.rates.INR) {
      const value = { rate: data.rates.INR, source: "Frankfurter (ECB reference rate)", asOf: data.date, live: true };
      cache = { value, fetchedAt: Date.now() };
      return value;
    }
  } catch (e) {
    /* fall through to snapshot */
  }
  const fb = Number(process.env.FALLBACK_USD_INR);
  if (Number.isFinite(fb) && fb > 0) {
    return { rate: fb, source: "Saved snapshot (live rate API unreachable)", asOf: "snapshot", live: false };
  }
  throw new Error("No exchange rate available. Set FALLBACK_USD_INR in .env.");
}

module.exports = { getUsdInr };
