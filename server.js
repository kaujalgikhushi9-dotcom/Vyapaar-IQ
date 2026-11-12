require("dotenv").config();
const path = require("path");
const express = require("express");

const fees = require("./fees.config");
const { computeQuote } = require("./pricing");
const { saveQuote, getQuote, markPaid, findByOrder, TTL_MS } = require("./quotes");
const { getUsdInr } = require("./rates");
const { runAgent } = require("./agent");
const paypal = require("./paypal");

const app = express();
app.use(express.json({ limit: "10kb" }));

// CORS: only needed if the teammate's frontend runs on a different address (e.g. localhost:5173).
// Set ALLOWED_ORIGIN in .env to that exact address. Leave empty if the frontend is served by this server.
app.use((req, res, next) => {
  const origin = process.env.ALLOWED_ORIGIN;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
  }
  next();
});
app.use(express.static(path.join(__dirname, "public")));

// ---- tiny per-IP rate limit (protects the LLM key on a public demo URL) ----
const hits = new Map();
function limit(max, windowMs) {
  return (req, res, next) => {
    const key = req.ip + req.path;
    const now = Date.now();
    const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (arr.length >= max) return res.status(429).json({ error: "Too many requests. Please wait a few minutes." });
    arr.push(now);
    hits.set(key, arr);
    next();
  };
}

// ---- shared helper: make + store a quote ----
async function createQuote({ sellerInrTarget, bufferPct }) {
  if (bufferPct === null || bufferPct === undefined || bufferPct === "") bufferPct = 2;
  const rate = await getUsdInr();
  const q = computeQuote({ sellerInrTarget, bufferPct, midRate: rate.rate });
  return saveQuote({ ...q, rate_source: rate.live ? `${rate.source}, ${rate.asOf}` : rate.source, rate_is_live: rate.live });
}

app.get("/api/config", (req, res) =>
  res.json({ paypalClientId: process.env.PAYPAL_CLIENT_ID || "", environment: "sandbox", quoteTtlMinutes: TTL_MS / 60000 })
);

app.get("/api/assumptions", (req, res) =>
  res.json({
    fee_source: fees.source,
    fee_page_as_of: fees.asOf,
    transaction_fee: `${fees.transactionPct}% + $${fees.fixedFee.USD.toFixed(2)} per international payment received`,
    fx_profiles: fees.fxSpreadProfiles,
    default_fx_profile: fees.defaultProfile,
    notes: [
      "Settlement amounts are ESTIMATES. The PayPal sandbox cannot send money to an Indian bank.",
      "Which conversion markup PayPal applies to an Indian seller's automatic USD to INR conversion is an assumption.",
      "The buffer is a safety margin, not a hedge or a guarantee.",
      "The quoted USD price is fixed. The PayPal order amount is never changed after checkout begins.",
    ],
  })
);

app.get("/api/rates", async (req, res, next) => {
  try { res.json(await getUsdInr()); } catch (e) { next(e); }
});

app.post("/api/quote", limit(30, 10 * 60 * 1000), async (req, res, next) => {
  try { res.json(await createQuote(req.body || {})); } catch (e) { e.status = 400; next(e); }
});

app.get("/api/quote/:id", (req, res) => {
  const q = getQuote(req.params.id);
  if (!q) return res.status(404).json({ error: "Quote not found" });
  res.json(q);
});

app.post("/api/agent", limit(20, 10 * 60 * 1000), async (req, res, next) => {
  try {
    const message = String((req.body && req.body.message) || "").slice(0, 500).trim();
    if (!message) return res.status(400).json({ error: "Message is empty" });
    res.json(await runAgent(message, { createQuote }));
  } catch (e) { next(e); }
});

// ---- PayPal sandbox ----
app.post("/api/paypal/create-order", limit(20, 10 * 60 * 1000), async (req, res, next) => {
  try {
    const q = getQuote(req.body && req.body.quoteId);
    if (!q) return res.status(404).json({ error: "Quote not found" });
    if (q.status !== "open") return res.status(409).json({ error: `Quote is ${q.status}. Please get a new quote.` });
    const order = await paypal.createOrder(q);
    q.order_id = order.id;
    res.json({ id: order.id });
  } catch (e) { next(e); }
});

app.post("/api/paypal/capture", limit(20, 10 * 60 * 1000), async (req, res, next) => {
  try {
    const orderId = req.body && req.body.orderId;
    const quote = findByOrder(orderId);
    if (!quote) return res.status(404).json({ error: "No quote found for this order" });
    if (Date.now() > Date.parse(quote.expires_at)) {
      return res.status(409).json({ error: "Quote expired before payment was captured. Please start again." });
    }
    const capture = await paypal.captureOrder(orderId);
    const info = paypal.extractBreakdown(capture);
    if (info.capture_status === "COMPLETED") markPaid(quote.id);
    res.json({
      quote,
      paypal: info,
      note: "Estimated INR is modeled from published fees. The sandbox does not settle to an Indian bank.",
    });
  } catch (e) { next(e); }
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const port = process.env.PORT || 3000;
if (require.main === module) app.listen(port, () => console.log(`Running on http://localhost:${port}`));
module.exports = app;
