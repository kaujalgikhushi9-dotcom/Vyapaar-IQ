// AI pricing assistant: an LLM with tool calling. The LLM never invents numbers.
// Every number comes from create_quote. Guardrails are enforced in code, not just in the prompt.
const fees = require("./fees.config");

const SYSTEM = `You are a pricing assistant for Indian freelancers and small sellers who get paid in US dollars through PayPal.
Rules you must follow:
- You do not know prices, exchange rates or fees. ALWAYS call create_quote to get numbers. Never calculate or guess a number yourself.
- Only state rupee and dollar amounts that appear in tool results.
- Never promise an exact rupee amount. Say "approximately" and give the range from the tool result.
- Use simple, plain English. Keep the answer under 120 words.
- Explain the buffer: a higher buffer protects you more if the dollar-rupee rate moves against you, but makes the buyer's price higher.
- The quote is a fixed price. Never say the product changes PayPal's checkout amount in real time.
- Only help with pricing for PayPal payments. Politely decline anything else.`;

const TOOLS = [
  {
    name: "create_quote",
    description:
      "Calculate the fixed USD price a seller should charge to receive about a target amount in INR, after PayPal fees, the currency conversion markup and a safety buffer. Returns the price and an estimated INR range.",
    input_schema: {
      type: "object",
      properties: {
        sellerInrTarget: { type: "number", description: "Rupees the seller wants to receive, e.g. 15000" },
        bufferPct: { type: "number", description: "Safety buffer in percent, 0 to 10. Default 2." },
      },
      required: ["sellerInrTarget"],
    },
  },
];

const BLOCKED = /guarantee|risk[- ]free|will (receive|get) exactly|changes? (the )?(paypal )?(checkout )?amount in real[- ]time/i;

function collectNumbers(x, out = []) {
  if (typeof x === "number") out.push(x);
  else if (Array.isArray(x)) x.forEach((v) => collectNumbers(v, out));
  else if (x && typeof x === "object") Object.values(x).forEach((v) => collectNumbers(v, out));
  return out;
}

// Every money figure in the reply must exist in a tool result (or in what the user typed).
function numbersAreGrounded(reply, allowed) {
  const re = /(?:₹|\$|Rs\.?\s?)\s?(\d[\d,]*(?:\.\d+)?)|(\d[\d,]*(?:\.\d+)?)\s?(?:USD|INR|dollars|rupees)/gi;
  let m;
  while ((m = re.exec(reply))) {
    const a = Number((m[1] || m[2]).replace(/,/g, ""));
    const ok = allowed.some((v) => Math.abs(v - a) <= 0.011 || (Number.isInteger(a) && Math.round(v) === a));
    if (!ok) return false;
  }
  return true;
}

function assumptionsBlock(quote) {
  return {
    estimate_note: "Estimate only. PayPal's real conversion rate and timing decide the final rupees.",
    items: [
      `PayPal fee: ${quote.modeled_fee_pct}% + $${quote.fixed_fee_usd.toFixed(2)} per payment (PayPal India fee page, ${fees.asOfShort})`,
      `Currency conversion markup modeled at ${quote.fx_spread_pct}% above the base rate (assumption, see profile)`,
      `Safety buffer: ${quote.buffer_pct}%`,
      `Exchange rate used: ${quote.mid_rate} INR per USD (${quote.rate_source})`,
    ],
  };
}

function templateReply(quote) {
  return (
    `To receive about ₹${quote.seller_inr_target.toLocaleString("en-IN")}, charge about $${quote.buyer_price.toFixed(2)}. ` +
    `You should get approximately ₹${quote.merchant_inr_low.toLocaleString("en-IN")} to ₹${quote.merchant_inr_high.toLocaleString("en-IN")}. ` +
    `A higher buffer protects you more if the rate moves against you, but makes the buyer's price higher.`
  );
}

function parseTargetFromText(text) {
  const m = text.replace(/,/g, "").match(/(\d{3,7})(?:\.\d+)?\s*(k)?/i);
  if (!m) return null;
  let n = Number(m[1]);
  if (m[2]) n *= 1000;
  return n;
}

// ---- LLM providers ----
// Default (free): Groq, which speaks the OpenAI chat format. Optional: Anthropic.
// Pick with LLM_PROVIDER=groq|anthropic, or just set whichever API key you have.
function pickProvider() {
  const forced = (process.env.LLM_PROVIDER || "").toLowerCase();
  if (forced === "groq" && process.env.GROQ_API_KEY) return "groq";
  if (forced === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

async function postJson(url, headers, body) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 25000);
  try {
    const res = await fetch(url, { method: "POST", signal: ctl.signal, headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "LLM request failed");
    return data;
  } finally {
    clearTimeout(t);
  }
}

const providers = {
  groq: {
    start: (userMessage) => [{ role: "system", content: SYSTEM }, { role: "user", content: userMessage }],
    async step(history) {
      const base = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
      const data = await postJson(
        `${base}/chat/completions`,
        { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        {
          model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
          max_tokens: 700,
          temperature: 0.2,
          messages: history,
          tools: TOOLS.map((t) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.input_schema } })),
          tool_choice: "auto",
        }
      );
      const msg = data.choices[0].message;
      const toolCalls = (msg.tool_calls || []).map((c) => {
        let input = {};
        try { input = JSON.parse(c.function.arguments || "{}"); } catch (e) { input = {}; }
        return { id: c.id, name: c.function.name, input };
      });
      return { text: (msg.content || "").trim(), toolCalls, assistantMsg: msg };
    },
    resultMsgs: (results) => results.map((r) => ({ role: "tool", tool_call_id: r.id, content: JSON.stringify(r.output) })),
  },

  anthropic: {
    start: (userMessage) => [{ role: "user", content: userMessage }],
    async step(history) {
      const data = await postJson(
        "https://api.anthropic.com/v1/messages",
        { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        { model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 700, system: SYSTEM, tools: TOOLS, messages: history }
      );
      const toolCalls = data.content.filter((b) => b.type === "tool_use").map((b) => ({ id: b.id, name: b.name, input: b.input }));
      const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      return { text, toolCalls, assistantMsg: { role: "assistant", content: data.content } };
    },
    resultMsgs: (results) => [
      { role: "user", content: results.map((r) => ({ type: "tool_result", tool_use_id: r.id, content: JSON.stringify(r.output) })) },
    ],
  },
};

// deps.createQuote({ sellerInrTarget, bufferPct }) -> quote object (from the pricing engine)
async function runAgent(userMessage, deps) {
  let lastQuote = null;
  const toolNumbers = [];
  const userNumbers = (userMessage.replace(/,/g, "").match(/\d+(?:\.\d+)?/g) || []).map(Number);

  const finish = (reply, mode, warnings = []) => ({
    reply,
    mode,
    quote: lastQuote,
    assumptions: lastQuote ? assumptionsBlock(lastQuote) : null,
    warnings,
  });

  const useTemplate = async (warning) => {
    const target = parseTargetFromText(userMessage);
    if (!target) {
      return finish("Tell me how many rupees you want to receive, for example: I want to get ₹15,000 from a US client.", "template", warning ? [warning] : []);
    }
    try {
      lastQuote = await deps.createQuote({ sellerInrTarget: target, bufferPct: 2 });
      return finish(templateReply(lastQuote), "template", warning ? [warning] : []);
    } catch (e) {
      return finish(`I could not make a quote: ${e.message}`, "template", warning ? [warning] : []);
    }
  };

  const name = pickProvider();
  if (!name) return useTemplate("AI model not configured, so this answer is from a fixed template.");
  const provider = providers[name];

  try {
    const history = provider.start(userMessage);
    for (let i = 0; i < 4; i++) {
      const step = await provider.step(history);
      history.push(step.assistantMsg);

      if (step.toolCalls.length) {
        const results = [];
        for (const call of step.toolCalls) {
          let output;
          try {
            if (call.name !== "create_quote") throw new Error("Unknown tool");
            lastQuote = await deps.createQuote(call.input);
            output = lastQuote;
            collectNumbers(output, toolNumbers);
          } catch (e) {
            output = { error: e.message };
          }
          results.push({ id: call.id, output });
        }
        history.push(...provider.resultMsgs(results));
        continue;
      }

      const text = step.text;
      if (!text) return useTemplate("The AI returned an empty answer, so a fixed template was used.");
      if (BLOCKED.test(text)) return useTemplate("The AI reply broke a safety rule, so a fixed template was used.");
      if (!numbersAreGrounded(text, [...toolNumbers, ...userNumbers])) {
        return useTemplate("The AI reply contained a figure not found in the pricing tool, so a fixed template was used.");
      }
      return finish(text, "ai");
    }
    return useTemplate("The AI took too many steps, so a fixed template was used.");
  } catch (e) {
    return useTemplate("The AI service was unavailable, so a fixed template was used.");
  }
}

module.exports = { runAgent, assumptionsBlock, numbersAreGrounded, BLOCKED, templateReply };
