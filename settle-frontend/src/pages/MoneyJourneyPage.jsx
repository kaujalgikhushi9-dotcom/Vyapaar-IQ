import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Banknote,
  CreditCard,
  Globe,
  Repeat,
} from 'lucide-react'
import {
  calculatePricing,
  formatINR,
  formatUSD,
} from '../lib/pricing'

const CUSHION_OPTIONS = [0, 3, 5, 10]

export default function MoneyJourneyPage() {
  const [target, setTarget] = useState('15000')
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [selectedCushion, setSelectedCushion] = useState(3)

  function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setResults([])

    const targetValue = Number(target)

    if (!target.trim() || !Number.isFinite(targetValue) || targetValue <= 0) {
      setError('Enter a target INR amount greater than zero.')
      return
    }

    try {
      const calculatedResults = CUSHION_OPTIONS.map((cushion) => {
        const pricing = calculatePricing(targetValue, cushion)

        return {
          cushion,
          targetInr: pricing.targetInr,
          buyerPrice: pricing.buyerPrice,
          estimatedNetInr: pricing.estimatedNetInr,
          paymentFeeInr: pricing.paymentFeeInr,
          conversionCostInr: pricing.conversionCostInr,
          grossInr: pricing.grossInr,
        }
      })

      setResults(calculatedResults)
      setSelectedCushion(3)
    } catch (pricingError) {
      setError(pricingError.message)
    }
  }

  function handleTargetChange(event) {
    setTarget(event.target.value)
    setError('')
    setResults([])
  }

  const selectedResult = results.find(
    (result) => result.cushion === selectedCushion,
  )

  const steps = selectedResult
    ? [
        {
          icon: Globe,
          title: 'Client pays',
          value: formatUSD(selectedResult.buyerPrice),
          detail: 'The USD price shown to your international client.',
          color: 'text-[#F5A623]',
          accent: 'border-[#F5A623]/40 bg-[#F5A623]/10',
        },
        {
          icon: CreditCard,
          title: 'Payment processing',
          value: `−${formatINR(selectedResult.paymentFeeInr)}`,
          detail: 'Modeled payment cost before conversion.',
          color: 'text-red-300',
          accent: 'border-red-400/30 bg-red-500/10',
        },
        {
          icon: Repeat,
          title: 'Currency conversion',
          value: `−${formatINR(selectedResult.conversionCostInr)}`,
          detail: 'Modeled cost of converting USD to INR.',
          color: 'text-red-300',
          accent: 'border-red-400/30 bg-red-500/10',
        },
        {
          icon: Banknote,
          title: 'Estimated net INR',
          value: formatINR(selectedResult.estimatedNetInr),
          detail: 'The estimated amount remaining after modeled costs.',
          color: 'text-[#29D6A0]',
          accent: 'border-[#29D6A0]/40 bg-[#29D6A0]/10',
        },
      ]
    : []

  return (
    <section className="mx-auto max-w-6xl">
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-full border border-[#29354D] bg-[#141D33] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#9AA8BC]">
          Money journey
        </span>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
          Explore every scenario.
        </h1>

        <p className="mt-5 text-lg leading-relaxed text-[#9AA8BC]">
          Compare currency-movement cushions and see how the estimated
          journey from client payment to INR changes.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[28px] border border-[#29354D] bg-[#141D33] p-7 sm:p-9"
        >
          <label
            htmlFor="journey-target"
            className="block text-sm font-medium text-[#DCE4F0]"
          >
            How much would you like to receive?
          </label>

          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#29354D] bg-[#10172A] px-6 py-5 transition focus-within:border-[#F5A623] focus-within:bg-[#0B1020]">
            <span className="text-3xl font-semibold text-[#9AA8BC]">
              ₹
            </span>

            <input
              id="journey-target"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={target}
              onChange={handleTargetChange}
              aria-describedby="journey-target-help"
              className="w-full bg-transparent text-4xl font-semibold text-white outline-none [font-variant-numeric:tabular-nums]"
              placeholder="15000"
            />
          </div>

          <p
            id="journey-target-help"
            className="mt-3 text-sm text-[#9AA8BC]"
          >
            Enter numbers without commas, such as 15000.
          </p>

          <button
            type="submit"
            className="group mt-9 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-6 py-4 text-base font-semibold text-[#0B1020] transition hover:bg-[#FFB843]"
          >
            Explore scenarios
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
            {results.length === 0 ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                <div className="inline-flex rounded-2xl border border-[#29354D] bg-[#10172A] p-4 text-[#F5A623]">
                  <Globe size={28} />
                </div>

                <h2 className="mt-7 text-2xl font-semibold tracking-tight text-white">
                  Compare your journey.
                </h2>

                <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#9AA8BC]">
                  Enter a target INR amount to compare 0%, 3%, 5%, and 10%
                  currency-movement cushions.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-[#DCE4F0]">
                  Choose a cushion
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {CUSHION_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedCushion(option)}
                      aria-pressed={selectedCushion === option}
                      className={`rounded-xl border px-4 py-4 text-sm font-semibold transition ${
                        selectedCushion === option
                          ? 'border-[#F5A623] bg-[#F5A623] text-[#0B1020]'
                          : 'border-[#29354D] bg-[#10172A] text-[#DCE4F0] hover:border-[#F5A623] hover:bg-[#19243B]'
                      }`}
                    >
                      {option}%
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-[#29354D] bg-[#10172A] p-6">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#9AA8BC]">
                    Estimated net INR
                  </p>

                  <p className="mt-3 text-4xl font-semibold tracking-tight text-[#29D6A0]">
                    {formatINR(selectedResult.estimatedNetInr)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedResult ? (
        <section className="mt-6 rounded-[28px] border border-[#29354D] bg-[#141D33] p-7 sm:p-9">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Journey for {selectedResult.cushion}% cushion
          </h2>

          <div className="relative mt-8">
            <div
              aria-hidden="true"
              className="absolute bottom-4 left-[27px] top-4 w-px bg-[#29354D]"
            />

            <div className="space-y-5">
              {steps.map((step, index) => (
                <motion.div
                  key={`${selectedResult.cushion}-${step.title}`}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="relative flex items-start gap-5"
                >
                  <div
                    className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${step.accent}`}
                  >
                    <step.icon size={24} className={step.color} />
                  </div>

                  <div className="flex-1 rounded-2xl border border-[#29354D] bg-[#10172A] p-5 transition hover:border-[#F5A623]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {step.title}
                        </p>

                        <p className="mt-1 text-sm leading-relaxed text-[#9AA8BC]">
                          {step.detail}
                        </p>
                      </div>

                      <p
                        className={`text-lg font-semibold ${step.color}`}
                      >
                        {step.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-[#9AA8BC]">
            Frontend estimates using fixed demo assumptions. Not live
            exchange rates, verified payment fees, or a guarantee of
            Vyapaar IQment.
          </p>
        </section>
      ) : null}
    </section>
  )
}