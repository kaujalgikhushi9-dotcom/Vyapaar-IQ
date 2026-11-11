import { useState } from 'react'
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const EARNINGS_DATA = [
  { month: 'Jun', amount: 42000 },
  { month: 'Jul', amount: 51500 },
  { month: 'Aug', amount: 47800 },
  { month: 'Sep', amount: 62400 },
  { month: 'Oct', amount: 58900 },
  { month: 'Nov', amount: 67300 },
]

function formatINR(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function EarningsOverviewPage() {
  const [selectedMonth, setSelectedMonth] = useState('Nov')

  const selected = EARNINGS_DATA.find(
    (item) => item.month === selectedMonth,
  )

  const previous = EARNINGS_DATA[
    EARNINGS_DATA.findIndex((item) => item.month === selectedMonth) - 1
  ]

  const change = previous
    ? ((selected.amount - previous.amount) / previous.amount) * 100
    : 0

  const isIncrease = change >= 0

  return (
    <section className="max-w-6xl">
      <p className="text-xs uppercase tracking-[0.18em] text-[#9AA8BC]">
        Earnings overview
      </p>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Understand your income.
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-[#9AA8BC]">
        Review estimated monthly earnings and identify the direction of
        change over time.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <div className="rounded-3xl border border-[#29354D] bg-[#141D33] p-7 sm:p-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-[#9AA8BC]">
                Estimated earnings · {selected.month}
              </p>

              <p className="mt-2 text-4xl font-semibold text-white">
                {formatINR(selected.amount)}
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium ${
                isIncrease
                  ? 'border-[#29D6A0] bg-[#10172A] text-[#29D6A0]'
                  : 'border-[#F5A623] bg-[#10172A] text-[#F5A623]'
              }`}
            >
              {isIncrease ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}

              {isIncrease ? '+' : ''}
              {change.toFixed(1)}% vs {previous ? previous.month : '—'}
            </div>
          </div>

          <div className="mt-10 flex h-64 items-end gap-4">
            {EARNINGS_DATA.map((item) => {
              const isSelected = item.month === selectedMonth
              const height = (item.amount / 70000) * 100

              return (
                <button
                  key={item.month}
                  type="button"
                  onClick={() => setSelectedMonth(item.month)}
                  aria-pressed={isSelected}
                  className="group flex h-full flex-1 flex-col items-center justify-end gap-3"
                >
                  <span
                    className={`w-full rounded-t-xl transition ${
                      isSelected
                        ? 'bg-[#F5A623]'
                        : 'bg-[#29354D] group-hover:bg-[#3A4A68]'
                    }`}
                    style={{ height: `${height}%` }}
                  />

                  <span
                    className={`text-xs ${
                      isSelected
                        ? 'font-semibold text-[#F5A623]'
                        : 'text-[#9AA8BC]'
                    }`}
                  >
                    {item.month}
                  </span>
                </button>
              )
            })}
          </div>

          <p className="mt-8 text-sm leading-relaxed text-[#9AA8BC]">
            These are sample figures for interface design. They are not
            connected to a payment provider or live financial account.
          </p>
        </div>

        <aside className="rounded-3xl border border-[#29354D] bg-[#141D33] p-7 sm:p-9">
          <div className="inline-flex rounded-2xl border border-[#29354D] bg-[#10172A] p-4 text-[#29D6A0]">
            <TrendingUp size={28} />
          </div>

          <h2 className="mt-6 text-2xl font-semibold tracking-tight">
            Monthly trend
          </h2>

          <p className="mt-3 text-[#9AA8BC]">
            Select a month to see its estimated earnings and change from the
            prior month.
          </p>

          <div className="mt-8 space-y-4">
            {EARNINGS_DATA.map((item) => (
              <button
                key={item.month}
                type="button"
                onClick={() => setSelectedMonth(item.month)}
                aria-pressed={item.month === selectedMonth}
                className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition ${
                  item.month === selectedMonth
                    ? 'border-[#F5A623] bg-[#10172A]'
                    : 'border-[#29354D] bg-[#10172A] hover:bg-[#19243B]'
                }`}
              >
                <span className="text-sm font-medium text-[#DCE4F0]">
                  {item.month}
                </span>

                <span className="text-sm font-semibold text-white">
                  {formatINR(item.amount)}
                </span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}