import { useState } from 'react'
import { ShieldCheck, ArrowRight } from 'lucide-react'

const CUSHION_OPTIONS = [0, 3, 5, 10]

const DEMO_ASSUMPTIONS = {
  referenceRate: 88.2,
  paymentFeePercent: 4,
  fixedFeeUsd: 0.3,
  conversionPercent: 3,
}

function formatINR(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatUSD(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function calculateBufferScenario(targetInr, cushionPercent) {
  const desiredNet = targetInr * (1 + cushionPercent / 100)
  const rate = DEMO_ASSUMPTIONS.referenceRate
  const paymentFeePercent = DEMO_ASSUMPTIONS.paymentFeePercent / 100
  const fixedFeeUsd = DEMO_ASSUMPTIONS.fixedFeeUsd
  const conversionPercent = DEMO_ASSUMPTIONS.conversionPercent / 100

  const requiredUsdBeforeFees =
    desiredNet / (rate * (1 - conversionPercent))

  const buyerPrice =
    (requiredUsdBeforeFees + fixedFeeUsd) / (1 - paymentFeePercent)

  const roundedBuyerPrice = Math.ceil(buyerPrice * 100) / 100

  const grossInr = roundedBuyerPrice * rate
  const paymentFeeInr =
    (roundedBuyerPrice * paymentFeePercent + fixedFeeUsd) * rate
  const amountAfterPaymentFee = grossInr - paymentFeeInr
  const conversionCostInr = amountAfterPaymentFee * conversionPercent
  const estimatedNetInr = amountAfterPaymentFee - conversionCostInr

  return {
    cushionPercent,
    buyerPrice: roundedBuyerPrice,
    grossInr,
    paymentFeeInr,
    conversionCostInr,
    estimatedNetInr,
  }
}

export default function SafetyBufferPage() {
  const [target, setTarget] = useState('15000')
  const [selectedCushion, setSelectedCushion] = useState(3)
  const [scenarios, setScenarios] = useState([])
  const [message, setMessage] = useState('')

  function handleTargetChange(event) {
    setTarget(event.target.value)
    setMessage('')
    setScenarios([])
  }

  function handleCushionChange(value) {
    setSelectedCushion(value)
    setMessage('')
    setScenarios([])
  }

  function handleSubmit(event) {
    event.preventDefault()

    const targetValue = Number(target)

    if (
      target.trim() === '' ||
      !Number.isFinite(targetValue) ||
      targetValue <= 0
    ) {
      setMessage('Enter a target INR amount greater than zero.')
      setScenarios([])
      return
    }

    const results = CUSHION_OPTIONS.map((cushion) =>
      calculateBufferScenario(targetValue, cushion),
    )

    setScenarios(results)
    setMessage('Buffer scenarios updated.')
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-full border border-[#29354D] bg-[#141D33] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#9AA8BC]">
          Safety buffer studio
        </span>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
          Choose your cushion.
        </h1>

        <p className="mt-5 text-lg leading-relaxed text-[#9AA8BC]">
          Compare currency-movement cushions and see how each choice affects
          the client price and your estimated INR outcome.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-[#29354D] bg-[#141D33] p-7 sm:p-9"
        >
          <label
            htmlFor="buffer-target-inr"
            className="block text-sm font-medium text-[#DCE4F0]"
          >
            How much would you like to receive?
          </label>

          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#29354D] bg-[#10172A] px-6 py-5 transition focus-within:border-[#F5A623] focus-within:bg-[#0B1020]">
            <span className="text-3xl font-semibold text-[#9AA8BC]">
              ₹
            </span>

            <input
              id="buffer-target-inr"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={target}
              onChange={handleTargetChange}
              aria-describedby="buffer-target-help"
              className="w-full bg-transparent text-4xl font-semibold text-white outline-none [font-variant-numeric:tabular-nums]"
            />
          </div>

          <p
            id="buffer-target-help"
            className="mt-3 text-sm text-[#9AA8BC]"
          >
            Enter numbers without commas, such as 15000.
          </p>

          <fieldset className="mt-8">
            <legend className="text-sm font-medium text-[#DCE4F0]">
              Currency-movement cushion
            </legend>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CUSHION_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleCushionChange(value)}
                  aria-pressed={selectedCushion === value}
                  className={`rounded-xl border px-4 py-4 text-sm font-semibold transition ${
                    selectedCushion === value
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
              Vyapaar IQment.
            </p>
          </fieldset>

          <button
            type="submit"
            className="group mt-9 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-6 py-4 text-base font-semibold text-[#0B1020] transition hover:bg-[#FFB843]"
          >
            Compare cushions
            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </button>

          {message ? (
            <p
              role="status"
              className="mt-5 rounded-xl border border-[#29354D] bg-[#10172A] px-4 py-3 text-sm text-[#DCE4F0]"
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
              Buffer comparison
            </h2>

            {scenarios.length === 0 ? (
              <p className="mt-3 text-[#9AA8BC]">
                Enter a target INR amount and choose “Compare cushions” to
                see the modeled scenarios.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.cushionPercent}
                    className={`rounded-2xl border p-5 transition ${
                      scenario.cushionPercent === selectedCushion
                        ? 'border-[#F5A623] bg-[#10172A]'
                        : 'border-[#29354D] bg-[#10172A]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-[#DCE4F0]">
                        {scenario.cushionPercent}% cushion
                      </p>

                      <p className="text-xl font-semibold text-[#F5A623]">
                        {formatUSD(scenario.buyerPrice)}
                      </p>
                    </div>

                    <dl className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-[#9AA8BC]">
                          Estimated net INR
                        </dt>

                        <dd className="font-semibold text-[#DCE4F0]">
                          {formatINR(scenario.estimatedNetInr)}
                        </dd>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-[#9AA8BC]">Payment cost</dt>

                        <dd className="text-[#DCE4F0]">
                          {formatINR(scenario.paymentFeeInr)}
                        </dd>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-[#9AA8BC]">
                          Conversion cost
                        </dt>

                        <dd className="text-[#DCE4F0]">
                          {formatINR(scenario.conversionCostInr)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9AA8BC]">
                Illustrative model
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[#9AA8BC]">
                Uses a reference rate of {DEMO_ASSUMPTIONS.referenceRate}{' '}
                INR per USD, a {DEMO_ASSUMPTIONS.paymentFeePercent}%
                payment fee, a {formatUSD(DEMO_ASSUMPTIONS.fixedFeeUsd)}{' '}
                fixed fee, and a {DEMO_ASSUMPTIONS.conversionPercent}%
                conversion allowance. These are illustrative assumptions, not
                verified live fees or rates, and do not imply a guaranteed
                Vyapaar IQment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}