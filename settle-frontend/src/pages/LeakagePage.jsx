import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowRight, ChartColumnDecreasing } from 'lucide-react'
import { formatINR } from '../lib/pricing'

const MONTHLY_DATA = [
  {
    month: 'Jan',
    paymentCost: 4200,
    conversionCost: 3100,
  },
  {
    month: 'Feb',
    paymentCost: 5100,
    conversionCost: 3800,
  },
  {
    month: 'Mar',
    paymentCost: 4800,
    conversionCost: 3600,
  },
  {
    month: 'Apr',
    paymentCost: 6200,
    conversionCost: 4700,
  },
  {
    month: 'May',
    paymentCost: 5600,
    conversionCost: 4200,
  },
  {
    month: 'Jun',
    paymentCost: 7100,
    conversionCost: 5300,
  },
]

export default function LeakagePage() {
  const [showBreakdown, setShowBreakdown] = useState(false)

  const totals = useMemo(() => {
    const paymentCost = MONTHLY_DATA.reduce(
      (total, item) => total + item.paymentCost,
      0,
    )
    const conversionCost = MONTHLY_DATA.reduce(
      (total, item) => total + item.conversionCost,
      0,
    )

    return {
      paymentCost,
      conversionCost,
      total: paymentCost + conversionCost,
    }
  }, [])

  const chartData = MONTHLY_DATA.map((item) => ({
    month: item.month,
    'Payment cost': item.paymentCost,
    'Conversion cost': item.conversionCost,
  }))

  return (
    <div className="min-h-screen bg-[#0B1020] px-6 py-10 text-white xl:px-12 xl:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#F5A623]">
            Leakage analysis
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight xl:text-5xl">
            Understand where value is lost.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-[#9AA8BC]">
            A frontend preview of modeled payment and conversion costs across
            recent months.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-[#29354D] bg-[#141D33] p-7 shadow-2xl shadow-black/30 xl:p-9">
            <div className="rounded-2xl border border-[#29354D] bg-[#10172A] p-6">
              <p className="text-sm text-[#9AA8BC]">
                Total modeled leakage
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-red-300 xl:text-5xl">
                {formatINR(totals.total)}
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
                <p className="text-sm text-[#9AA8BC]">
                  Payment costs
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatINR(totals.paymentCost)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
                <p className="text-sm text-[#9AA8BC]">
                  Conversion costs
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatINR(totals.conversionCost)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#29354D] bg-[#10172A] px-6 py-4 text-base font-semibold text-white transition hover:border-[#F5A623]"
            >
              {showBreakdown ? 'Hide breakdown' : 'View monthly breakdown'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </section>

          <section className="rounded-3xl border border-[#29354D] bg-[#141D33] p-7 shadow-2xl shadow-black/30 xl:p-9">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-[#29354D] bg-[#10172A] p-4">
                <ChartColumnDecreasing className="h-7 w-7 text-[#F5A623]" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Monthly cost breakdown
                </h2>
                <p className="mt-2 text-sm text-[#9AA8BC]">
                  Modeled payment and conversion costs by month.
                </p>
              </div>
            </div>

            <div className="mt-6 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#29354D"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#9AA8BC"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9AA8BC"
                    tickLine={false}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(245, 166, 35, 0.08)' }}
                    contentStyle={{
                      backgroundColor: '#10172A',
                      border: '1px solid #29354D',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                    }}
                    formatter={(value) => formatINR(value)}
                  />
                  <Legend />
                  <Bar
                    dataKey="Payment cost"
                    fill="#F5A623"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="Conversion cost"
                    fill="#29D6A0"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {showBreakdown && (
          <section className="mt-6 rounded-3xl border border-[#29354D] bg-[#141D33] p-7 shadow-2xl shadow-black/30 xl:p-9">
            <h2 className="text-xl font-semibold">Monthly details</h2>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-[#29354D] text-sm text-[#9AA8BC]">
                    <th className="pb-4 pr-4 font-medium">Month</th>
                    <th className="pb-4 pr-4 font-medium">Payment cost</th>
                    <th className="pb-4 pr-4 font-medium">
                      Conversion cost
                    </th>
                    <th className="pb-4 font-medium">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {MONTHLY_DATA.map((item) => (
                    <tr
                      key={item.month}
                      className="border-b border-[#29354D]/60"
                    >
                      <td className="py-4 pr-4 font-semibold text-white">
                        {item.month}
                      </td>
                      <td className="py-4 pr-4 text-red-300">
                        {formatINR(item.paymentCost)}
                      </td>
                      <td className="py-4 pr-4 text-red-300">
                        {formatINR(item.conversionCost)}
                      </td>
                      <td className="py-4 font-semibold text-white">
                        {formatINR(item.paymentCost + item.conversionCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-[#9AA8BC]">
              Frontend preview with sample data. These figures are illustrative
              and are not connected to a bank, payment provider, or live
              exchange-rate service.
            </p>
          </section>
        )}
      </div>
    </div>
  )
}