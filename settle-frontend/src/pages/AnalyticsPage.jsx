import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowRight, TrendingUp } from 'lucide-react'
import {
  calculatePricing,
  formatINR,
  formatUSD,
} from '../lib/pricing'

const CUSHION_OPTIONS = [0, 3, 5, 10]

const BAR_COLORS = {
  0: '#9AA8BC',
  3: '#F5A623',
  5: '#FFB843',
  10: '#29D6A0',
}

export default function AnalyticsPage() {
  const [target, setTarget] = useState('15000')
  const [error, setError] = useState('')
  const [results, setResults] = useState([])

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
          allowanceInr: pricing.allowanceInr,
        }
      })

      setResults(calculatedResults)
    } catch (pricingError) {
      setError(pricingError.message)
    }
  }

  function handleTargetChange(event) {
    setTarget(event.target.value)
    setError('')
    setResults([])
  }

  const chartData = results.map((result) => ({
    cushion: `${result.cushion}%`,
    estimatedNet: result.estimatedNetInr,
    paymentCost: result.paymentFeeInr,
    conversionCost: result.conversionCostInr,
  }))

  return (
    <section className="mx-auto max-w-6xl">
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-full border border-[#29354D] bg-[#141D33] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#9AA8BC]">
          Analytics
        </span>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
          See the cushion effect.
        </h1>

        <p className="mt-5 text-lg leading-relaxed text-[#9AA8BC]">
          Compare how different currency-movement cushions affect the
          suggested client price and estimated net INR.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[28px] border border-[#29354D] bg-[#141D33] p-7 sm:p-9"
        >
          <label
            htmlFor="analytics-target"
            className="block text-sm font-medium text-[#DCE4F0]"
          >
            How much would you like to receive?
          </label>

          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#29354D] bg-[#10172A] px-6 py-5 transition focus-within:border-[#F5A623] focus-within:bg-[#0B1020]">
            <span className="text-3xl font-semibold text-[#9AA8BC]">
              ₹
            </span>

            <input
              id="analytics-target"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={target}
              onChange={handleTargetChange}
              aria-describedby="analytics-target-help"
              className="w-full bg-transparent text-4xl font-semibold text-white outline-none [font-variant-numeric:tabular-nums]"
              placeholder="15000"
            />
          </div>

          <p
            id="analytics-target-help"
            className="mt-3 text-sm text-[#9AA8BC]"
          >
            Enter numbers without commas, such as 15000.
          </p>

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
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#F5A623]/10 blur-3xl"
          />

          <div className="relative">
            {results.length === 0 ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                <div className="inline-flex rounded-2xl border border-[#29354D] bg-[#10172A] p-4 text-[#F5A623]">
                  <TrendingUp size={28} />
                </div>

                <h2 className="mt-7 text-2xl font-semibold tracking-tight text-white">
                  Compare your options.
                </h2>

                <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#9AA8BC]">
                  Enter a target INR amount to compare 0%, 3%, 5%, and 10%
                  currency-movement cushions.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Estimated net INR by cushion
                </h2>

                <div className="mt-6 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#29354D"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="cushion"
                        stroke="#9AA8BC"
                        tickLine={false}
                        axisLine={false}
                      />

                      <YAxis
                        stroke="#9AA8BC"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value / 1000}k`}
                      />

                     <Tooltip
  cursor={{ fill: 'rgba(245, 166, 35, 0.08)' }}
  contentStyle={{
    backgroundColor: '#10172A',
    border: '1px solid #29354D',
    borderRadius: '12px',
    color: '#F5A623',
  }}
  labelStyle={{
    color: '#DCE4F0',
    fontWeight: 600,
  }}
  itemStyle={{
    color: '#F5A623',
  }}
  formatter={(value) => formatINR(value)}
/>

                      <Bar
                        dataKey="estimatedNet"
                        radius={[10, 10, 0, 0]}
                        maxBarSize={56}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={entry.cushion}
                            fill={
                              BAR_COLORS[
                                CUSHION_OPTIONS[index]
                              ] || '#F5A623'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {results.length > 0 ? (
        <section className="mt-6 rounded-[28px] border border-[#29354D] bg-[#141D33] p-7 sm:p-9">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Cushion comparison
          </h2>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-[#29354D] text-xs uppercase tracking-[0.12em] text-[#9AA8BC]">
                  <th className="pb-4 pr-4 font-medium">Cushion</th>
                  <th className="pb-4 pr-4 font-medium">Client price</th>
                  <th className="pb-4 pr-4 font-medium">Estimated net</th>
                  <th className="pb-4 pr-4 font-medium">Payment cost</th>
                  <th className="pb-4 font-medium">Conversion cost</th>
                </tr>
              </thead>

              <tbody>
                {results.map((result) => (
                  <tr
                    key={result.cushion}
                    className="border-b border-[#29354D]/60 transition hover:bg-[#10172A]"
                  >
                    <td className="py-4 pr-4 font-semibold text-white">
                      {result.cushion}%
                    </td>

                    <td className="py-4 pr-4 text-[#DCE4F0]">
                      {formatUSD(result.buyerPrice)}
                    </td>

                    <td className="py-4 pr-4 font-semibold text-[#29D6A0]">
                      {formatINR(result.estimatedNetInr)}
                    </td>

                    <td className="py-4 pr-4 text-red-300">
                      −{formatINR(result.paymentFeeInr)}
                    </td>

                    <td className="py-4 text-red-300">
                      −{formatINR(result.conversionCostInr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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