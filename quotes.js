const crypto = require("crypto");

const TTL_MS = 15 * 60 * 1000; // quotes are valid for 15 minutes
const store = new Map();

function saveQuote(q) {
  const now = Date.now();
  const quote = {
    id: "q_" + crypto.randomBytes(6).toString("hex"),
    ...q,
    locked_at: new Date(now).toISOString(),
    expires_at: new Date(now + TTL_MS).toISOString(),
    status: "open",
  };
  store.set(quote.id, quote);
  return quote;
}

function getQuote(id) {
  const q = store.get(id);
  if (!q) return null;
  if (q.status === "open" && Date.now() > Date.parse(q.expires_at)) q.status = "expired";
  return q;
}

function markPaid(id) {
  const q = store.get(id);
  if (q) q.status = "paid";
}

function findByOrder(orderId) {
  for (const q of store.values()) if (q.order_id === orderId) return q;
  return null;
}

module.exports = { saveQuote, getQuote, markPaid, findByOrder, TTL_MS };
