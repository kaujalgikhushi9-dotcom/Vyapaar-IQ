import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowRight, Activity } from 'lucide-react'
import { calculateSettlement, formatINR, formatUSD } from '../lib/pricing'

const RATE_SCENARIOS = [84, 85, 86, 87, 88.2, 89, 90, 91, 92]

export default function RateExplorerPage() {
  const [clientPrice, setClientPrice] = useState('400')
  const [error, setError] = useState('')
  const [scenarios, setScenarios] = useState([])

  function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setScenarios([])

    const price = Number(clientPrice)

    if (!clientPrice.trim() || !Number.isFinite(price) || price <= 0) {
      setError('Enter a client price greater than zero.')
      return
    }

    const calculatedScenarios = RATE_SCENARIOS.map((rate) => {
      const settlement = calculateSettlement(price)
    
      return {
        rate,
        grossInr: price * rate,
        estimatedNetInr:
          settlement.estimatedNetInr *
          (rate / 88.2),
      }
    })

    setScenarios(calculatedScenarios)
  }

  function handlePriceChange(event) {
    setPrice(event.target.value)
    setError('')
    setScenarios([])
  }

  const chartData = scenarios.map((scenario) => ({
    rate: scenario.rate,
    estimatedNet: scenario.estimatedNetInr,
  }))

  return (
    <div className="min-h-screen bg-[#0B1020] px-6 py-10 text-white xl:px-12 xl:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#F5A623]">
            Rate explorer
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight xl:text-5xl">
            See rate scenarios.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-[#9AA8BC]">
            Explore how illustrative USD–INR rate scenarios could affect the
            estimated INR remaining after modeled costs.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-[#29354D] bg-[#141D33] p-7 shadow-2xl shadow-black/30 xl:p-9">
            <form onSubmit={handleSubmit} noValidate>
              <label
                htmlFor="client-price"
                className="block text-sm font-medium text-[#9AA8BC]"
              >
                Client price
              </label>

              <div className="mt-3 flex items-center rounded-2xl border border-[#29354D] bg-[#10172A] px-5 py-4 transition focus-within:border-[#F5A623]">
                <span className="mr-3 text-2xl font-semibold text-[#F5A623]">
                  $
                </span>
                <input
                  id="client-price"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={clientPrice}
                  onChange={handlePriceChange}
                  className="w-full bg-transparent text-3xl font-semibold tracking-tight text-white outline-none placeholder:text-[#4B5A73] xl:text-4xl"
                  placeholder="400"
                />
              </div>

              <p className="mt-3 text-sm text-[#9AA8BC]">
                Enter numbers without commas, such as 400.
              </p>

              <button
                type="submit"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F5A623] px-6 py-4 text-base font-semibold text-[#0B1020] transition hover:bg-[#FFB843]"
              >
                Explore scenarios
                <ArrowRight className="h-5 w-5" />
              </button>

              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-300"
                >
                  {error}
                </p>
              )}
            </form>
          </section>

          <section className="rounded-3xl border border-[#29354D] bg-[#141D33] p-7 shadow-2xl shadow-black/30 xl:p-9">
            {scenarios.length === 0 ? (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                <div className="rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
                  <Activity className="h-8 w-8 text-[#F5A623]" />
                </div>

                <h2 className="mt-6 text-2xl font-semibold">
                  Explore rate impact.
                </h2>

                <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#9AA8BC]">
                  Enter a client price to see illustrative USD–INR scenarios
                  and their effect on estimated net INR.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold">
                  Estimated net INR by rate
                </h2>

                <div className="mt-6 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="rateGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#F5A623"
                            stopOpacity={0.45}
                          />
                          <stop
                            offset="100%"
                            stopColor="#F5A623"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#29354D"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="rate"
                        stroke="#9AA8BC"
                        tickLine={false}
                        tickFormatter={(value) => `₹${value}`}
                      />

                      <YAxis
                        stroke="#9AA8BC"
                        tickLine={false}
                        tickFormatter={(value) => `₹${value / 1000}k`}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#10172A',
                          border: '1px solid #29354D',
                          borderRadius: '12px',
                          color: '#FFFFFF',
                        }}
                        formatter={(value) => formatINR(value)}
                        labelFormatter={(value) => `Rate: ₹${value}`}
                      />

                      <ReferenceLine
                        x={88.2}
                        stroke="#29D6A0"
                        strokeDasharray="4 4"
                      />

                      <Area
                        type="monotone"
                        dataKey="estimatedNet"
                        stroke="#F5A623"
                        strokeWidth={3}
                        fill="url(#rateGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </section>
        </div>

        {scenarios.length > 0 && (
          <section className="mt-6 rounded-3xl border border-[#29354D] bg-[#141D33] p-7 shadow-2xl shadow-black/30 xl:p-9">
            <h2 className="text-xl font-semibold">Scenario breakdown</h2>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-[#29354D] text-sm text-[#9AA8BC]">
                    <th className="pb-4 pr-4 font-medium">Rate</th>
                    <th className="pb-4 pr-4 font-medium">Gross INR</th>
                    <th className="pb-4 font-medium">Estimated net INR</th>
                  </tr>
                </thead>

                <tbody>
                  {scenarios.map((scenario) => (
                    <tr
                      key={scenario.rate}
                      className="border-b border-[#29354D]/60"
                    >
                      <td className="py-4 pr-4 font-semibold text-white">
                        ₹{scenario.rate}
                      </td>
                      <td className="py-4 pr-4 text-[#9AA8BC]">
                        {formatINR(scenario.grossInr)}
                      </td>
                      <td className="py-4 font-semibold text-[#29D6A0]">
                        {formatINR(scenario.estimatedNetInr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-[#9AA8BC]">
              Frontend scenario preview using illustrative rates and fixed
              demo assumptions. Not live market data, verified payment fees,
              or a guarantee of Vyapaar IQment.
            </p>
          </section>
        )}
      </div>
    </div>
  )
}