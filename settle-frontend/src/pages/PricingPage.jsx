import { useRef, useState } from 'react'
import {
  ArrowRight,
  Calculator,
  Check,
  ChevronDown,
  Copy,
  ShieldCheck,
} from 'lucide-react'
import {
  calculatePriceFromApi,
  createQuoteFromApi,
  formatINR,
  formatUSD,
} from '../lib/pricing'

const CUSHION_OPTIONS = [0, 3, 5, 10]
const MAX_TARGET_INR = 10000000

function formatTargetInput(value) {
  const digitsOnly = value.replace(/[^0-9.]/g, '')

  if (!digitsOnly) {
    return ''
  }

  const [wholePart, decimalPart] = digitsOnly.split('.')

  const formattedWholePart = new Intl.NumberFormat('en-IN').format(
    Number(wholePart),
  )

  return decimalPart !== undefined
    ? `${formattedWholePart}.${decimalPart}`
    : formattedWholePart
}

export default function PricingPage() {
  const [target, setTarget] = useState('15,000')
  const [buffer, setBuffer] = useState(3)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [result, setResult] = useState(null)
  const [copyState, setCopyState] = useState('idle')
  const [isStale, setIsStale] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingQuote, setIsCreatingQuote] = useState(false)
  const [savedQuote, setSavedQuote] = useState(null)
  const [paypalOrder, setPaypalOrder] = useState(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [showAssumptions, setShowAssumptions] = useState(false)
  const targetInputRef = useRef(null)

  function handleTargetChange(event) {
    setTarget(formatTargetInput(event.target.value))
    setMessage('')
    setCopyState('idle')
    setSavedQuote(null)
    setPaypalOrder(null)

    if (result) {
      setIsStale(true)
    }
  }

  function handleBufferChange(value) {
    setBuffer(value)
    setMessage('')
    setCopyState('idle')
    setSavedQuote(null)
    setPaypalOrder(null)

    if (result) {
      setIsStale(true)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const targetValue = Number(target.replace(/,/g, ''))

    if (targetValue > MAX_TARGET_INR) {
      setMessage(
        'Enter a target INR amount of ₹1,00,00,000 or less for this preview.',
      )
      setMessageType('error')
      setResult(null)
      setCopyState('idle')
      setIsStale(false)
      return
    }

    setIsLoading(true)
    setMessage('')
    setCopyState('idle')
    setIsStale(false)
    setSavedQuote(null)
    setPaypalOrder(null)

    try {
      const apiResult = await calculatePriceFromApi({
        targetInr: targetValue,
        bufferPercent: buffer,
      })

      const breakdown = apiResult.breakdown || {}

      const grossInr =
        breakdown.mid_market_value_inr ??
        apiResult.mid_market_value_inr ??
        0

      const paymentFeeInr =
        breakdown.paypal_fee_usd != null
          ? breakdown.paypal_fee_usd * (apiResult.mid_rate || 0)
          : 0

      const conversionCostInr =
        breakdown.fx_markup_cost_inr ??
        apiResult.fx_markup_cost_inr ??
        0

      const estimatedNetInr =
        apiResult.merchant_inr_high ??
        apiResult.estimated_inr_if_rate_unchanged ??
        targetValue

      const allowanceInr = Math.max(
        0,
        estimatedNetInr - targetValue,
      )

      setResult({
        buyerPrice: apiResult.buyer_price ?? apiResult.buyerPrice ?? 0,
        targetInr: apiResult.seller_inr_target ?? targetValue,
        bufferPercent: apiResult.buffer_pct ?? buffer,
        grossInr,
        paymentFeeInr,
        conversionCostInr,
        estimatedNetInr,
        allowanceInr,
        simpleConversion: {
          estimatedNetInr: targetValue,
        },
      })

      setMessage('Pricing estimate ready.')
      setMessageType('success')
      setCopyState('idle')
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
      setResult(null)
      setCopyState('idle')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateQuote() {
    const targetValue = Number(target.replace(/,/g, ''))

    if (!result || isStale) {
      setMessage('Calculate the client price first.')
      setMessageType('error')
      return
    }

    setIsCreatingQuote(true)
    setMessage('')
    setSavedQuote(null)
    setPaypalOrder(null)

    try {
      const quote = await createQuoteFromApi({
        targetInr: targetValue,
        bufferPercent: buffer,
      })

      setSavedQuote(quote)
      setMessage('Quote created successfully.')
      setMessageType('success')
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setIsCreatingQuote(false)
    }
  }

  async function handleCreatePaypalOrder() {
    if (!savedQuote) return

    setIsCreatingOrder(true)
    setMessage('')
    setPaypalOrder(null)

    try {
      const response = await fetch(
        'http://localhost:3000/api/paypal/create-order',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteId: savedQuote.id,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not create PayPal order.')
      }

      setPaypalOrder(data)
      setMessage('PayPal sandbox order created.')
      setMessageType('success')
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setIsCreatingOrder(false)
    }
  }

  async function handleCapturePayment() {
    if (!paypalOrder) return

    setIsCapturing(true)
    setMessage('')

    try {
      const response = await fetch(
        'http://localhost:3000/api/paypal/capture',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: paypalOrder.id,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not capture payment.')
      }

      setMessage('Payment captured. Quote marked as paid.')
      setMessageType('success')
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setIsCapturing(false)
    }
  }

  async function handleCopyClientPrice() {
    if (!result) {
      return
    }

    const clientPrice = result.buyerPrice.toFixed(2)

    try {
      await navigator.clipboard.writeText(clientPrice)
      setCopyState('copied')
    } catch {
      setCopyState('manual')
    }

    setTimeout(() => {
      setCopyState('idle')
    }, 2500)
  }

  function handleNewEstimate() {
    setTarget('')
    setMessage('')
    setMessageType('success')
    setResult(null)
    setCopyState('idle')
    setIsStale(false)
    setSavedQuote(null)
    setPaypalOrder(null)

    targetInputRef.current?.focus()
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-full border border-[#29354D] bg-[#141D33] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#9AA8BC]">
          Smart pricing
        </span>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
          Your target. Your terms.
        </h1>

        <p className="mt-5 text-lg leading-relaxed text-[#9AA8BC]">
          Start with the rupees you want to receive. We’ll help you estimate
          a clearer client-facing price before checkout.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-[#29354D] bg-[#141D33] p-7 sm:p-9"
        >
          <div>
            <label
              htmlFor="target-inr"
              className="block text-sm font-medium text-[#DCE4F0]"
            >
              How much would you like to receive?
            </label>

            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#29354D] bg-[#10172A] px-6 py-5 transition focus-within:border-[#F5A623] focus-within:bg-[#0B1020]">
              <span className="text-3xl font-semibold text-[#9AA8BC]">
                ₹
              </span>

              <input
                id="target-inr"
                ref={targetInputRef}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={target}
                onChange={handleTargetChange}
                aria-describedby="target-help"
                className="w-full bg-transparent text-4xl font-semibold text-white outline-none [font-variant-numeric:tabular-nums]"
              />
            </div>

            <p
              id="target-help"
              className="mt-3 text-sm text-[#9AA8BC]"
            >
              Enter the amount in Indian Rupees. Commas are added
              automatically. Maximum: ₹1,00,00,000.
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-[#29354D] bg-[#10172A] px-5 py-4">
            <div>
              <p className="text-sm font-medium text-[#DCE4F0]">
                Client currency
              </p>

              <p className="mt-1 text-xs text-[#9AA8BC]">
                Fixed for this version
              </p>
            </div>

            <span className="rounded-xl border border-[#29354D] bg-[#141D33] px-4 py-2 text-sm font-medium text-[#DCE4F0]">
              USD · US dollars
            </span>
          </div>

          <fieldset className="mt-8">
            <legend className="text-sm font-medium text-[#DCE4F0]">
              Currency-movement cushion
            </legend>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CUSHION_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleBufferChange(value)}
                  aria-pressed={buffer === value}
                  className={`rounded-xl border px-4 py-4 text-sm font-semibold transition ${
                    buffer === value
                      ? 'border-[#F5A623] bg-[#F5A623] text-[#0B1020]'
                      : 'border-[#29354D] bg-[#10172A] text-[#DCE4F0] hover:border-[#F5A623] hover:bg-[#19243B]'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#9AA8BC]">
              A pricing allowance for exchange-rate changes—not a guaranteed
              settlement.
            </p>
          </fieldset>

          <button
            type="submit"
            disabled={isLoading}
            className="group mt-9 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-6 py-4 text-base font-semibold text-[#0B1020] transition hover:bg-[#FFB843] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Calculating…' : 'Calculate client price'}

            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </button>

          {message ? (
            <p
              role="status"
              className={`mt-5 rounded-xl border px-4 py-3 text-sm leading-relaxed ${
                messageType === 'error'
                  ? 'border-red-500/40 bg-red-500/10 text-red-300'
                  : 'border-[#29D6A0]/40 bg-[#29D6A0]/10 text-[#29D6A0]'
              }`}
            >
              {message}
            </p>
          ) : null}
        </form>

        <div className="relative overflow-hidden rounded-[28px] border border-[#29354D] bg-[#141D33] p-7 sm:p-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#29D6A0]/10 blur-3xl"
          />

          <div className="relative">
            <div className="inline-flex rounded-2xl border border-[#29354D] bg-[#10172A] p-4 text-[#29D6A0]">
              <ShieldCheck size={28} />
            </div>

            <h2 className="mt-7 text-2xl font-semibold tracking-tight text-white">
              A clearer client price.
            </h2>

            <p className="mt-3 text-[#9AA8BC]">
              Enter a target INR amount and select a cushion to generate an
              illustrative client-facing price.
            </p>

            {result && isStale ? (
              <div className="mt-6 rounded-2xl border border-[#F5A623]/40 bg-[#F5A623]/10 p-4">
                <p className="text-sm font-semibold text-[#F5A623]">
                  Inputs changed
                </p>

                <p className="mt-2 text-sm leading-relaxed text-[#9AA8BC]">
                  The estimate below reflects your previous inputs. Click
                  <span className="font-semibold text-white">
                    {' '}
                    Calculate client price{' '}
                  </span>
                  to update it.
                </p>
              </div>
            ) : null}

            {result ? (
              <>
                <div className="mt-6 rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#9AA8BC]">
                    Suggested client price
                  </p>

                  <p className="mt-3 text-3xl font-semibold text-white">
                    {formatUSD(result.buyerPrice)}
                  </p>

                  <p className="mt-2 text-sm text-[#9AA8BC]">
                    To target {formatINR(result.targetInr)} with a{' '}
                    {result.bufferPercent}% cushion.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleCreateQuote}
                      disabled={isCreatingQuote || isStale}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#F5A623] px-4 py-2.5 text-sm font-semibold text-[#0B1020] transition hover:bg-[#FFB843] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCreatingQuote
                        ? 'Creating quote…'
                        : 'Create quote'}

                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyClientPrice}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#29354D] bg-[#0B1020] px-4 py-2.5 text-sm font-semibold text-[#DCE4F0] transition hover:border-[#F5A623] hover:text-white"
                    >
                      {copyState === 'copied' ? (
                        <>
                          <Check size={16} className="text-[#29D6A0]" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy client price
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleNewEstimate}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#29354D] bg-[#0B1020] px-4 py-2.5 text-sm font-semibold text-[#DCE4F0] transition hover:border-[#F5A623] hover:text-white"
                    >
                      Start a new estimate
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  {copyState === 'manual' ? (
                    <p className="mt-3 text-xs leading-relaxed text-[#9AA8BC]">
                      Clipboard access was blocked. Copy this amount manually:{' '}
                      <span className="font-semibold text-white">
                        {result.buyerPrice.toFixed(2)}
                      </span>
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#9AA8BC]">
                    Estimated INR outcome
                  </p>

                  <p className="mt-3 text-3xl font-semibold text-white">
                    {formatINR(result.estimatedNetInr)}
                  </p>

                  <p className="mt-2 text-sm text-[#9AA8BC]">
                    Estimated net after modeled deductions.
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#9AA8BC]">
                    Estimated breakdown
                  </p>

                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-[#9AA8BC]">Gross INR</dt>
                      <dd className="font-medium text-white">
                        {formatINR(result.grossInr)}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between">
                      <dt className="text-[#9AA8BC]">Payment fee</dt>
                      <dd className="font-medium text-white">
                        -{formatINR(result.paymentFeeInr)}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between">
                      <dt className="text-[#9AA8BC]">Conversion cost</dt>
                      <dd className="font-medium text-white">
                        -{formatINR(result.conversionCostInr)}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#29354D]/60 pt-3">
                      <dt className="font-medium text-[#DCE4F0]">
                        Estimated net
                      </dt>
                      <dd className="font-semibold text-white">
                        {formatINR(result.estimatedNetInr)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-4 rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#9AA8BC]">
                    Close the gap
                  </p>

                  <p className="mt-3 text-sm leading-relaxed text-[#9AA8BC]">
                    A simple conversion at the same reference rate would
                    estimate{' '}
                    {formatINR(
                      result.simpleConversion.estimatedNetInr,
                    )}{' '}
                    net. The selected cushion adds{' '}
                    {formatINR(result.allowanceInr)} above your original
                    target.
                  </p>
                </div>

                {savedQuote ? (
                  <div className="mt-4 rounded-2xl border border-[#29D6A0]/40 bg-[#29D6A0]/10 p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#29D6A0]">
                      Quote saved
                    </p>

                    <p className="mt-3 font-mono text-sm text-white">
                      {savedQuote.id}
                    </p>

                    <p className="mt-2 text-sm text-[#9AA8BC]">
                      This quote is now visible in Transactions.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleCreatePaypalOrder}
                        disabled={isCreatingOrder}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#F5A623] px-4 py-2.5 text-sm font-semibold text-[#0B1020] transition hover:bg-[#FFB843] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCreatingOrder
                          ? 'Creating order…'
                          : 'Proceed to checkout'}
                      </button>

                      {paypalOrder?.approval_url ? (
                        <a
                          href={paypalOrder.approval_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-[#29354D] bg-[#0B1020] px-4 py-2.5 text-sm font-semibold text-[#DCE4F0] transition hover:border-[#F5A623] hover:text-white"
                        >
                          Open PayPal Sandbox
                        </a>
                      ) : null}

                      {paypalOrder ? (
                        <button
                          type="button"
                          onClick={handleCapturePayment}
                          disabled={isCapturing}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#29D6A0]/40 bg-[#29D6A0]/10 px-4 py-2.5 text-sm font-semibold text-[#29D6A0] transition hover:bg-[#29D6A0]/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isCapturing
                            ? 'Capturing…'
                            : 'Capture sandbox payment'}
                        </button>
                      ) : null}

                      <a
                        href="/transactions"
                        className="inline-flex items-center gap-2 rounded-xl border border-[#29354D] bg-[#0B1020] px-4 py-2.5 text-sm font-semibold text-[#DCE4F0] transition hover:border-[#F5A623] hover:text-white"
                      >
                        View Transactions
                        <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-[#29354D] bg-[#10172A] p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#29354D] bg-[#0B1020]">
                    <Calculator size={22} className="text-[#F5A623]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      No estimate yet
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-[#9AA8BC]">
                      Enter the INR amount you want to receive, choose a
                      cushion, and click
                      <span className="font-semibold text-white">
                        {' '}
                        Calculate client price{' '}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-[#29354D] bg-[#0B1020] px-4 py-3">
                    <span className="text-sm text-[#9AA8BC]">
                      Suggested client price
                    </span>

                    <span className="font-semibold text-white">$—</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#29354D] bg-[#0B1020] px-4 py-3">
                    <span className="text-sm text-[#9AA8BC]">
                      Estimated INR outcome
                    </span>

                    <span className="font-semibold text-white">₹—</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#29354D] bg-[#0B1020] px-4 py-3">
                    <span className="text-sm text-[#9AA8BC]">
                      Estimated breakdown
                    </span>

                    <span className="font-semibold text-white">
                      Awaiting inputs
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
              <button
                type="button"
                onClick={() => setShowAssumptions((current) => !current)}
                aria-expanded={showAssumptions}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#9AA8BC]">
                    Estimate assumptions
                  </p>

                  <p className="mt-2 text-sm font-medium text-[#DCE4F0]">
                    Review the illustrative inputs behind this estimate
                  </p>
                </div>

                <ChevronDown
                  size={20}
                  className={`shrink-0 text-[#9AA8BC] transition ${
                    showAssumptions ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showAssumptions ? (
                <div className="mt-5 space-y-3 border-t border-[#29354D]/60 pt-5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9AA8BC]">Reference FX rate</span>
                    <span className="font-medium text-white">
                      ₹88.20 per USD
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#9AA8BC]">Payment fee</span>
                    <span className="font-medium text-white">
                      4.4% + $0.30
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#9AA8BC]">
                      Conversion reduction
                    </span>
                    <span className="font-medium text-white">3%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#9AA8BC]">Cushion</span>
                    <span className="font-medium text-white">
                      {buffer}%
                    </span>
                  </div>

                  <p className="pt-3 text-xs leading-relaxed text-[#9AA8BC]">
                    These are illustrative assumptions for this preview. They
                    do not guarantee settlement, lock an exchange rate, or
                    represent a live payment-provider quote.
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-[#9AA8BC]">
                  This uses illustrative assumptions for FX and payment costs.
                  It does not guarantee settlement, lock an exchange rate, or
                  represent a live payment-provider quote.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}