// PayPal Orders v2 (SANDBOX). The order amount is the quoted price and is never changed after creation.
const API = "https://api-m.sandbox.paypal.com";
let tokenCache = null;

async function getToken() {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token;
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal sandbox keys are not set in .env");
  const res = await fetch(`${API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("PayPal token request failed: " + (data.error_description || data.error || res.status));
  tokenCache = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return tokenCache.token;
}

async function createOrder(quote) {
  const token = await getToken();
  const res = await fetch(`${API}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: quote.id,
          description: "Fixed-price quote (sandbox test)",
          amount: { currency_code: "USD", value: quote.buyer_price.toFixed(2) },
        },
      ],
    }),
  });
  const data = await res.json();
  if (!data.id) throw new Error("PayPal create order failed: " + JSON.stringify(data));
  return data;
}

async function captureOrder(orderId) {
  const token = await getToken();
  const res = await fetch(`${API}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error("PayPal capture failed: " + JSON.stringify(data));
  return data;
}

// Pull whatever fee/net data PayPal returned (field names depend on the response, so every access is optional).
function extractBreakdown(capture) {
  const c = capture?.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    capture_id: c?.id || null,
    capture_status: c?.status || capture?.status || null,
    amount: c?.amount || null,
    seller_receivable_breakdown: c?.seller_receivable_breakdown || null,
  };
}

module.exports = { createOrder, captureOrder, extractBreakdown };
