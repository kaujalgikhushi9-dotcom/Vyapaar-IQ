import { motion } from 'framer-motion'
import {
  ArrowDown,
  Banknote,
  CheckCircle2,
  CreditCard,
  Globe,
  Repeat,
} from 'lucide-react'
import { formatINR, formatUSD } from '../lib/pricing'

export default function MoneyJourney({ result }) {
  if (!result) {
    return (
      <section className="rounded-3xl border border-[#29354D] bg-[#141D33] p-7 xl:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#F5A623]">
          Money journey
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Follow every rupee.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#9AA8BC]">
          Calculate a price first to see how the client payment moves through
          modeled processing and conversion costs.
        </p>
      </section>
    )
  }

  const steps = [
    {
      icon: Globe,
      title: 'Client pays',
      value: formatUSD(result.buyerPrice),
      detail: 'The USD price shown to your international client.',
      color: 'text-[#F5A623]',
      accent: 'border-[#F5A623]/40 bg-[#F5A623]/10',
    },
    {
      icon: CreditCard,
      title: 'Payment processing',
      value: `−${formatINR(result.paymentFeeInr)}`,
      detail: 'Modeled payment cost before conversion.',
      color: 'text-red-300',
      accent: 'border-red-400/30 bg-red-500/10',
    },
    {
      icon: Repeat,
      title: 'Currency conversion',
      value: `−${formatINR(result.conversionCostInr)}`,
      detail: 'Modeled cost of converting USD to INR.',
      color: 'text-red-300',
      accent: 'border-red-400/30 bg-red-500/10',
    },
    {
      icon: Banknote,
      title: 'Estimated net INR',
      value: formatINR(result.estimatedNetInr),
      detail: 'The estimated amount remaining after modeled costs.',
      color: 'text-[#29D6A0]',
      accent: 'border-[#29D6A0]/40 bg-[#29D6A0]/10',
    },
  ]

  return (
    <section className="rounded-3xl border border-[#29354D] bg-[#141D33] p-7 shadow-2xl shadow-black/30 xl:p-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#F5A623]">
            Money journey
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white xl:text-3xl">
            Follow every rupee.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#9AA8BC]">
            This is a frontend visualization of the modeled journey from the
            client’s USD payment to your estimated INR.
          </p>
        </div>

        <div className="rounded-full border border-[#29354D] bg-[#10172A] px-4 py-2 text-xs font-medium text-[#9AA8BC]">
          {formatUSD(result.buyerPrice)} → {formatINR(result.estimatedNetInr)}
        </div>
      </div>

      <div className="relative mt-8">
        <div className="absolute left-[27px] top-4 bottom-4 w-px bg-[#29354D]" />

        <div className="space-y-5">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: index * 0.09 }}
              className="relative flex items-start gap-5"
            >
              <div
                className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${step.accent}`}
              >
                <step.icon className={`h-6 w-6 ${step.color}`} />
              </div>

              <div className="flex-1 rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#9AA8BC]">
                      {step.detail}
                    </p>
                  </div>

                  <p className={`text-lg font-semibold ${step.color}`}>
                    {step.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center rounded-2xl border border-[#29354D] bg-[#0B1020] p-4">
        <ArrowDown className="h-5 w-5 text-[#9AA8BC]" />
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#29D6A0]" />
        <p className="text-sm leading-relaxed text-[#9AA8BC]">
          Your target is{' '}
          <span className="font-semibold text-white">
            {formatINR(result.targetInr)}
          </span>
          . This journey estimates the amount remaining after modeled payment
          and conversion costs.
        </p>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#9AA8BC]">
        Illustrative frontend estimate. Not a live exchange rate, verified
        payment fee, or guarantee of Vyapaar IQment.
      </p>
    </section>
  )
}