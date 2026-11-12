const crypto = require("crypto");

const TTL_MS = 15 * 60 * 1000;
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

  if (q.status === "open" && Date.now() > Date.parse(q.expires_at)) {
    q.status = "expired";
  }

  return q;
}

function markPaid(id) {
  const q = store.get(id);

  if (!q) return;

  q.status = "paid";
  q.paid_at = new Date().toISOString();
}

function findByOrder(orderId) {
  for (const q of store.values()) {
    if (q.order_id === orderId) return q;
  }

  return null;
}

function getEarningsOverview() {
  const quotes = Array.from(store.values());
  const paidQuotes = quotes.filter((q) => q.status === "paid");

  const completedInr = paidQuotes.reduce(
    (total, q) => total + Number(q.seller_inr_target || 0),
    0
  );

  const openQuotes = quotes.filter((q) => q.status === "open");
  const pendingInr = openQuotes.reduce(
    (total, q) => total + Number(q.seller_inr_target || 0),
    0
  );

  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthTotal = paidQuotes.reduce((total, q) => {
      const paidDate = q.paid_at ? new Date(q.paid_at) : null;

      if (!paidDate) return total;

      const matchesMonth =
        paidDate.getFullYear() === year &&
        paidDate.getMonth() === month;

      return matchesMonth
        ? total + Number(q.seller_inr_target || 0)
        : total;
    }, 0);

    months.push({
      month: label,
      amount: monthTotal,
    });
  }

  return {
    completed_inr: completedInr,
    pending_inr: pendingInr,
    completed_count: paidQuotes.length,
    pending_count: openQuotes.length,
    total_quotes: quotes.length,
    monthly: months,
  };
}

function getTransactions() {
  const quotes = Array.from(store.values());

  return quotes
    .map((q) => ({
      id: q.id,
      seller_inr_target: q.seller_inr_target,
      buyer_price: q.buyer_price,
      status: q.status,
      locked_at: q.locked_at,
      expires_at: q.expires_at,
      order_id: q.order_id || null,
      paid_at: q.paid_at || null,
    }))
    .sort((a, b) => new Date(b.locked_at) - new Date(a.locked_at));
}

module.exports = {
  saveQuote,
  getQuote,
  markPaid,
  findByOrder,
  getEarningsOverview,
  getTransactions,
  TTL_MS,
};