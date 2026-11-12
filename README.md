# INR-Stable Pricing Assistant: Part 3 (AI assistant, PayPal sandbox, demo)

For Indian freelancers paid in USD through PayPal. The seller says how many rupees they want to receive. An AI assistant
(an LLM that calls a pricing tool) recommends a fixed USD price, explains the trade-offs, and a sandbox buyer pays that exact price.
The page shows where the money goes (PayPal fee, currency markup) and an **estimated** rupee range.

> **Sandbox only.** No real money moves. Rupee amounts are modeled estimates, never guarantees.

## Run it (Node 18 or newer)

```bash
npm install
cp .env.example .env        # Windows PowerShell: copy .env.example .env
# fill in .env (see below), then:
npm start                   # http://localhost:3000
npm test                    # pricing + guardrail tests
```

### What goes in `.env`
| Variable | What it is |
|---|---|
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | From developer.paypal.com > Apps & Credentials > **Sandbox** |
| `GROQ_API_KEY` | **Free** key for the AI assistant from console.groq.com (no credit card). If no AI key is set, the app runs in clearly labeled **template mode** |
| `GROQ_MODEL` | Defaults to `llama-3.3-70b-versatile` |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Optional paid alternative (Claude). Used only if no Groq key is set, or if `LLM_PROVIDER=anthropic` |
| `ALLOWED_ORIGIN` | Only if the frontend runs on another address (CORS), e.g. `http://localhost:5173` |
| `FALLBACK_USD_INR` | Used only if the live rate API is unreachable; shown as a "snapshot", never as live |

Never commit `.env`. It is in `.gitignore`.

### Test the payment
1. Start the app and click **₹15,000 example**.
2. Click the PayPal button. Log in with the sandbox **personal (buyer)** account from your PayPal developer dashboard.
3. Approve. The app captures the payment and shows the status and any fee data PayPal returned.

## How it works
1. `agent.js`: the LLM (tool calling) may only call `create_quote`. All numbers come from `pricing.js`.
2. **Guardrails enforced in code:** every money figure in the AI reply must exist in the tool result; promise language ("guarantee") is blocked; assumptions are rendered by the app, not by the model. If any check fails, a fixed template answer is used.
3. `paypal.js`: creates an order for exactly the quoted USD price (never changed after checkout starts) and captures it. Expired quotes are rejected at order creation and capture.
4. `rates.js`: USD/INR reference rate from Frankfurter (ECB data), 10-minute cache, snapshot fallback.

## What is real and what is estimated
- **Real:** PayPal sandbox order creation and capture; the live reference exchange rate (when reachable); the LLM tool calling.
- **Modeled (estimates):** the PayPal fee and currency markup use PayPal's published India merchant fee page
  (https://pep.paypal.com/in/business/paypal-business-fees, page dated 28 March 2024: 4.40% + $0.30 for international payments received;
  3.0% above the base rate for converting payments received). **Which conversion markup applies to an Indian seller's automatic conversion is an assumption**;
  `fees.config.js` has a second 4.0% profile.
- **Not simulated:** the sandbox cannot send money to an Indian bank, so "rupees received" is a computed range.

## Tools used
- LLM: Llama 3.3 70B served by Groq (OpenAI-compatible chat API with function/tool calling) for the pricing assistant. Anthropic Claude is supported as an optional alternative.
- PayPal Orders v2 + PayPal JS SDK (sandbox).
- Frankfurter API for reference exchange rates.

## Team integration notes
- `pricing.js` is a stand-in. Keep `computeQuote({ sellerInrTarget, bufferPct, midRate })` or call the real pricing service from `createQuote` in `server.js`.
- API: `POST /api/agent`, `POST /api/quote`, `GET /api/quote/:id`, `GET /api/assumptions`, `GET /api/rates`, `POST /api/paypal/create-order`, `POST /api/paypal/capture`.
- Public demo URL: the agent and PayPal endpoints are rate-limited per IP so strangers cannot burn the LLM key.

## Limits
USD only. Quotes are held in memory and expire after 15 minutes (a server restart clears them). Not for production use.

## License
MIT
