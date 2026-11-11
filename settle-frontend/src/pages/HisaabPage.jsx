import { useState } from 'react'
import { ArrowRight, Calculator, ShieldCheck } from 'lucide-react'
import {
  calculatePricing,
  formatINR,
  formatUSD,
} from '../lib/pricing'

const CUSHION_OPTIONS = [0, 3, 5, 10]

export default function HisaabPage() {
  const [target, setTarget] = useState('15000')
  const [buffer, setBuffer] = useState(3)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setResult(null)

    const targetValue = Number(target)

    if (!target.trim() || !Number.isFinite(targetValue) || targetValue <= 0) {
      setError('Enter a target INR amount greater than zero.')
      return
    }

    try {
      setResult(calculatePricing(targetValue, buffer))
    } catch (pricingError) {
      setError(pricingError.message)
    }
  }

  function handleTargetChange(event) {
    setTarget(event.target.value)
    setError('')
    setResult(null)
  }

  function handleCushionChange(value) {
    setBuffer(value)
    setError('')
    setResult(null)
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-full border border-[#29354D] bg-[#141D33] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#9AA8BC]">
          Your Hisaab
        </span>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
          Know where every rupee goes.
        </h1>

        <p className="mt-5 text-lg leading-relaxed text-[#9AA8BC]">
          Enter a target INR amount to see a consistent frontend breakdown of
          the client price, modeled costs, and estimated net amount.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[28px] border border-[#29354D] bg-[#141D33] p-7 sm:p-9"
        >
          <label
            htmlFor="hisab-target"
            className="block text-sm font-medium text-[#DCE4F0]"
          >
            How much would you like to receive?
          </label>

          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#29354D] bg-[#10172A] px-6 py-5 transition focus-within:border-[#F5A623] focus-within:bg-[#0B1020]">
            <span className="text-3xl font-semibold text-[#9AA8BC]">₹</span>

            <input
              id="hisab-target"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={target}
              onChange={handleTargetChange}
              aria-describedby="hisab-target-help"
              className="w-full bg-transparent text-4xl font-semibold text-white outline-none [font-variant-numeric:tabular-nums]"
              placeholder="15000"
            />
          </div>

          <p
            id="hisab-target-help"
            className="mt-3 text-sm text-[#9AA8BC]"
          >
            Enter numbers without commas, such as 15000.
          </p>

          <fieldset className="mt-8">
            <legend className="text-sm font-medium text-[#DCE4F0]">
              Currency-movement cushion
            </legend>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CUSHION_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleCushionChange(option)}
                  aria-pressed={buffer === option}
                  className={`rounded-xl border px-4 py-4 text-sm font-semibold transition ${
                    buffer === option
                      ? 'border-[#F5A623] bg-[#F5A623] text-[#0B1020]'
                      : 'border-[#29354D] bg-[#10172A] text-[#DCE4F0] hover:border-[#F5A623] hover:bg-[#19243B]'
                  }`}
                >
                  {option}%
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
            Calculate my Hisaab
            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </button>

          {error ? (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </p>
          ) : null}
        </form>

        <div className="relative overflow-hidden rounded-[28px] border border-[#29354D] bg-[#141D33] p-7 sm:p-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#29D6A0]/10 blur-3xl"
          />

          <div className="relative">
            {!result ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                <div className="inline-flex rounded-2xl border border-[#29354D] bg-[#10172A] p-4 text-[#F5A623]">
                  <Calculator size={28} />
                </div>

                <h2 className="mt-7 text-2xl font-semibold tracking-tight text-white">
                  Your financial picture.
                </h2>

                <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#9AA8BC]">
                  Enter your target and cushion to see the estimated client
                  price and modeled INR breakdown.
                </p>
              </div>
            ) : (
              <div>
                <div className="rounded-2xl border border-[#29354D] bg-[#10172A] p-6">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#9AA8BC]">
                    Suggested client price
                  </p>

                  <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
                    {formatUSD(result.buyerPrice)}
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-[#29354D] bg-[#10172A] p-6">
                  <dl className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-sm text-[#9AA8BC]">
                        Target INR
                      </dt>

                      <dd className="font-semibold text-white">
                        {formatINR(result.targetInr)}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-sm text-[#9AA8BC]">
                        Gross INR received
                      </dt>

                      <dd className="font-semibold text-white">
                        {formatINR(result.grossInr)}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-sm text-[#9AA8BC]">
                        Modeled payment cost
                      </dt>

                      <dd className="font-semibold text-red-300">
                        −{formatINR(result.paymentFeeInr)}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-sm text-[#9AA8BC]">
                        Modeled conversion cost
                      </dt>

                      <dd className="font-semibold text-red-300">
                        −{formatINR(result.conversionCostInr)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 border-t border-[#29354D] pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-[#9AA8BC]">
                        Estimated net INR
                      </span>

                      <span className="text-2xl font-semibold text-[#29D6A0]">
                        {formatINR(result.estimatedNetInr)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#29354D] bg-[#10172A] p-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck
                      size={20}
                      className="text-[#29D6A0]"
                    />

                    <h3 className="text-base font-semibold text-white">
                      Close the gap
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-[#9AA8BC]">
                    A simple conversion at the reference rate could leave a
                    modeled shortfall of{' '}
                    <span className="font-semibold text-white">
                      {formatINR(result.gapInr)}
                    </span>
                    . The suggested price adds an allowance of{' '}
                    <span className="font-semibold text-[#F5A623]">
                      {formatINR(result.allowanceInr)}
                    </span>{' '}
                    above your original target.
                  </p>
                </div>

                <p className="mt-6 text-xs leading-relaxed text-[#9AA8BC]">
                  Frontend estimate using fixed demo assumptions. Not a live
                  exchange rate, verified payment fee, or guarantee of
                  Vyapaar IQment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}