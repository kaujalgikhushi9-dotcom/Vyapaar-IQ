// Stand-in pricing engine. If Person 1's engine is ready, keep the same function
// signature and replace this file (or call their API from server.js).
const fees = require("./fees.config");

const round2 = (x) => Math.round(x * 100) / 100;
const ceil2 = (x) => Math.ceil(x * 100 - 1e-9) / 100; // round UP so the seller is never short

const LIMITS = { minInr: 100, maxInr: 1_000_000, maxBufferPct: 10 };

function computeQuote({ sellerInrTarget, bufferPct = 2, midRate, profile = fees.defaultProfile }) {
  const target = Number(sellerInrTarget);
  const buffer = Number(bufferPct);
  const mid = Number(midRate);

  if (!Number.isFinite(target) || target < LIMITS.minInr || target > LIMITS.maxInr) {
    throw new Error(`Target must be between INR ${LIMITS.minInr} and INR ${LIMITS.maxInr}.`);
  }
  if (!Number.isFinite(buffer) || buffer < 0 || buffer > LIMITS.maxBufferPct) {
    throw new Error(`Buffer must be between 0 and ${LIMITS.maxBufferPct} percent.`);
  }
  if (!Number.isFinite(mid) || mid <= 0) throw new Error("Exchange rate is not available.");
  const fx = fees.fxSpreadProfiles[profile];
  if (!fx) throw new Error("Unknown fee profile.");

  const pct = fees.transactionPct / 100;
  const fixed = fees.fixedFee.USD;
  const s = fx.pct / 100;
  const b = buffer / 100;

  // Work backwards: rupees wanted -> USD net needed -> USD the buyer must pay.
  const effectiveRate = mid * (1 - s) * (1 - b); // worst case within the buffer
  const netUsdNeeded = target / effectiveRate;
  const buyerPrice = ceil2((netUsdNeeded + fixed) / (1 - pct));

  // Now go forwards from the final price so every number is consistent.
  const feeUsd = round2(buyerPrice * pct + fixed);
  const netUsd = round2(buyerPrice - feeUsd);
  const midValueInr = netUsd * mid;
  const spreadCostInr = midValueInr * s;
  const inrExpected = midValueInr * (1 - s); // if the rate does not move
  const inrLow = inrExpected * (1 - b); // if the rate falls by the whole buffer

  return {
    seller_inr_target: target,
    buyer_currency: "USD",
    mid_rate: round2(mid * 10000) / 10000,
    buffer_pct: buffer,
    modeled_fee_pct: fees.transactionPct,
    fixed_fee_usd: fixed,
    fx_spread_pct: fx.pct,
    fx_profile: profile,
    buyer_price: buyerPrice,
    merchant_inr_low: Math.round(inrLow),
    merchant_inr_high: Math.round(inrExpected),
    breakdown: {
      gross_usd: buyerPrice,
      paypal_fee_usd: feeUsd,
      net_usd: netUsd,
      mid_market_value_inr: Math.round(midValueInr),
      fx_markup_cost_inr: Math.round(spreadCostInr),
      estimated_inr_if_rate_unchanged: Math.round(inrExpected),
      estimated_inr_worst_case_in_buffer: Math.round(inrLow),
    },
  };
}

module.exports = { computeQuote, LIMITS };
