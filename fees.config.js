// All fee numbers come from PayPal's own India merchant fee page:
// https://pep.paypal.com/in/business/paypal-business-fees
// The page header says "Last Updated: 28 March 2024". Re-check it before you submit.
module.exports = {
  source: "https://pep.paypal.com/in/business/paypal-business-fees",
  asOf: "28 March 2024 (as shown on the page; re-check before submitting)",
  asOfShort: "page dated 28 March 2024",

  // "Receiving international transactions": sender outside India = 4.40% + fixed fee
  transactionPct: 4.4,
  // Fixed fee depends on the currency received. USD only in this version.
  fixedFee: { USD: 0.3 },

  // Currency conversion markup above the base exchange rate.
  // Which one applies to an Indian seller's automatic USD->INR conversion is an ASSUMPTION.
  fxSpreadProfiles: {
    received: {
      pct: 3.0,
      label: "Converting balance and payments received: 3.0% above base rate",
    },
    other: {
      pct: 4.0,
      label: "Conversions in all other cases (INR): 4.00% above base rate",
    },
  },
  defaultProfile: "received",
};
