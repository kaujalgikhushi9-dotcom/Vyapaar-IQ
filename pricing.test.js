const test = require("node:test");
const assert = require("node:assert");
const { computeQuote } = require("./pricing");
const { numbersAreGrounded, BLOCKED } = require("./agent");

const RATE = 85; // arbitrary rate used only for tests

test("seller never ends up below target when the rate falls by the whole buffer", () => {
  for (const target of [100, 999, 5000, 15000, 250000]) {
    for (const buf of [0, 1, 2, 5, 10]) {
      const q = computeQuote({ sellerInrTarget: target, bufferPct: buf, midRate: RATE });
      assert.ok(q.breakdown.estimated_inr_worst_case_in_buffer >= target - 1, `target ${target} buffer ${buf}`);
    }
  }
});

test("zero buffer gives a (nearly) single value", () => {
  const q = computeQuote({ sellerInrTarget: 15000, bufferPct: 0, midRate: RATE });
  assert.ok(Math.abs(q.merchant_inr_high - q.merchant_inr_low) <= 1);
});

test("higher buffer means a higher buyer price", () => {
  const a = computeQuote({ sellerInrTarget: 15000, bufferPct: 1, midRate: RATE }).buyer_price;
  const b = computeQuote({ sellerInrTarget: 15000, bufferPct: 8, midRate: RATE }).buyer_price;
  assert.ok(b > a);
});

test("price has at most 2 decimals and range is ordered", () => {
  const q = computeQuote({ sellerInrTarget: 12345, bufferPct: 3, midRate: RATE });
  assert.strictEqual(Math.round(q.buyer_price * 100) / 100, q.buyer_price);
  assert.ok(q.merchant_inr_low <= q.merchant_inr_high);
});

test("small amounts still work (fixed fee dominates)", () => {
  const q = computeQuote({ sellerInrTarget: 100, bufferPct: 2, midRate: RATE });
  assert.ok(q.buyer_price > 1);
});

test("invalid inputs are rejected", () => {
  assert.throws(() => computeQuote({ sellerInrTarget: 0, midRate: RATE }));
  assert.throws(() => computeQuote({ sellerInrTarget: -50, midRate: RATE }));
  assert.throws(() => computeQuote({ sellerInrTarget: "abc", midRate: RATE }));
  assert.throws(() => computeQuote({ sellerInrTarget: 5000, bufferPct: 50, midRate: RATE }));
  assert.throws(() => computeQuote({ sellerInrTarget: 5000, bufferPct: -1, midRate: RATE }));
  assert.throws(() => computeQuote({ sellerInrTarget: 5000, midRate: 0 }));
  assert.throws(() => computeQuote({ sellerInrTarget: 5000, midRate: RATE, profile: "nope" }));
});

test("guardrail: ungrounded money figures are caught", () => {
  assert.ok(numbersAreGrounded("Charge about $180.45 to get ₹15,000.", [180.45, 15000]));
  assert.ok(!numbersAreGrounded("Charge about $199.99 to get ₹15,000.", [180.45, 15000]));
  assert.ok(!numbersAreGrounded("You will get ₹16,000.", [15000]));
});

test("guardrail: promise language is blocked", () => {
  assert.ok(BLOCKED.test("We guarantee you will get it"));
  assert.ok(!BLOCKED.test("You should get approximately ₹14,000 to ₹15,000."));
});
