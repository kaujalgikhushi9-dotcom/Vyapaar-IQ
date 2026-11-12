const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

export const DEMO_ASSUMPTIONS = Object.freeze({
  referenceRate: 88.2,
  paymentFeePercent: 4,
  fixedFeeUsd: 0.3,
  conversionPercent: 3,
})

export function formatINR(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatUSD(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateSettlement(
  buyerPrice,
  assumptions = DEMO_ASSUMPTIONS,
) {
  const {
    referenceRate,
    paymentFeePercent,
    fixedFeeUsd,
    conversionPercent,
  } = assumptions

  const grossInr = roundMoney(buyerPrice * referenceRate)

  const paymentFeeInr = roundMoney(
    (buyerPrice * (paymentFeePercent / 100) + fixedFeeUsd) *
      referenceRate,
  )

  const afterPaymentFee = roundMoney(grossInr - paymentFeeInr)

  const conversionCostInr = roundMoney(
    afterPaymentFee * (conversionPercent / 100),
  )

  const estimatedNetInr = roundMoney(
    afterPaymentFee - conversionCostInr,
  )

  return {
    buyerPrice,
    grossInr,
    paymentFeeInr,
    conversionCostInr,
    estimatedNetInr,
    totalDeductionsInr: roundMoney(
      paymentFeeInr + conversionCostInr,
    ),
  }
}

export function calculatePricing(targetInr, bufferPercent) {
  if (!Number.isFinite(targetInr) || targetInr <= 0) {
    throw new Error('Enter an INR target greater than zero.')
  }

  if (
    !Number.isFinite(bufferPercent) ||
    bufferPercent < 0 ||
    bufferPercent > 10
  ) {
    throw new Error('Choose a cushion between 0% and 10%.')
  }

  const {
    referenceRate,
    paymentFeePercent,
    fixedFeeUsd,
    conversionPercent,
  } = DEMO_ASSUMPTIONS

  const desiredNetInr = targetInr * (1 + bufferPercent / 100)

  const priceBeforeRounding =
    (desiredNetInr /
      (referenceRate * (1 - conversionPercent / 100)) +
      fixedFeeUsd) /
    (1 - paymentFeePercent / 100)

  let buyerPrice = Math.ceil(priceBeforeRounding * 100) / 100
  let settlement = calculateSettlement(buyerPrice)

  while (settlement.estimatedNetInr < desiredNetInr) {
    buyerPrice = roundMoney(buyerPrice + 0.01)
    settlement = calculateSettlement(buyerPrice)
  }

  const simpleConversionPrice = roundMoney(targetInr / referenceRate)

  const simpleConversion = calculateSettlement(simpleConversionPrice)

  return {
    ...settlement,
    targetInr,
    bufferPercent,
    simpleConversion,
    gapInr: roundMoney(
      Math.max(0, targetInr - simpleConversion.estimatedNetInr),
    ),
    allowanceInr: roundMoney(
      Math.max(0, settlement.estimatedNetInr - targetInr),
    ),
  }
}

export async function calculatePriceFromApi({
  targetInr,
  currency = "USD",
  bufferPercent = 3,
}) {
  const response = await fetch(
    `${BACKEND_BASE_URL}/api/pricing/preview`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sellerInrTarget: targetInr,
        bufferPct: bufferPercent,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not calculate the price.");
  }

  return data;
}

export async function createQuoteFromApi({
  targetInr,
  bufferPercent,
}) {
  const response = await fetch(
    `${BACKEND_BASE_URL}/api/quote`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sellerInrTarget: targetInr,
        bufferPct: bufferPercent,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not create the quote.");
  }

  return data;
}