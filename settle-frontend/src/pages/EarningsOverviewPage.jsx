import { useEffect, useState } from 'react'
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const EMPTY_MONTHS = [
  { month: 'Jan', amount: 0 },
  { month: 'Feb', amount: 0 },
  { month: 'Mar', amount: 0 },
  { month: 'Apr', amount: 0 },
  { month: 'May', amount: 0 },
  { month: 'Jun', amount: 0 },
]

function formatINR(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export default function EarningsOverviewPage() {
  const [earnings, setEarnings] = useState(null)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')

  useEffect(() => {
    async function loadEarnings() {
      try {
        const response = await fetch(
          'http://localhost:3000/api/earnings/overview',
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Could not load earnings')
        }

        setEarnings(data)

        const latestMonth = data.monthly[data.monthly.length - 1]

        if (latestMonth) {
          setSelectedMonth(latestMonth.month)
        }
      } catch (err) {
        setError(err.message)
      }
    }

    loadEarnings()
  }, [])

  if (error) {
    return (
      <section className="max-w-6xl">
        <p className="text-xs uppercase tracking-[0.18em] text-[#9AA8BC]">
          Earnings overview
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Understand your income.
        </h1>

        <div className="mt-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-7">
          <h2 className="text-xl font-semibold text-red-300">
            Could not load earnings
          </h2>

          <p className="mt-3 text-[#9AA8BC]">{error}</p>

          <p className="mt-4 text-sm text-[#9AA8BC]">
            Make sure the Node server is running on port 3000.
          </p>
        </div>
      </section>
    )
  }

  if (!earnings) {
    return (
      <section className="max-w-6xl">
        <p className="text-xs uppercase tracking-[0.18em] text-[#9AA8BC]">
          Earnings overview
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Understand your income.
        </h1>

        <p className="mt-4 text-lg text-[#9AA8BC]">Loading earnings…</p>
      </section>
    )
  }

  const monthly = earnings.monthly && earnings.monthly.length
    ? earnings.monthly
    : EMPTY_MONTHS

  const selected =
    monthly.find((item) => item.month === selectedMonth) || monthly[0]

  const selectedIndex = monthly.findIndex(
    (item) => item.month === selected.month,
  )

  const previous = selectedIndex > 0 ? monthly[selectedIndex - 1] : null

  const change = previous && previous.amount > 0
    ? ((selected.amount - previous.amount) / previous.amount) * 100
    : 0

  const isIncrease = change >= 0

  const highestAmount = Math.max(
    ...monthly.map((item) => item.amount),
    1,
  )

  return (
    <section className="max-w-6xl">
      <p className="text-xs uppercase tracking-[0.18em] text-[#9AA8BC]">
        Earnings overview
      </p>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Understand your income.
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-[#9AA8BC]">
        Review estimated monthly earnings from completed payments and identify
        the direction of change over time.
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
            {monthly.map((item) => {
              const isSelected = item.month === selected.month
              const height = (item.amount / highestAmount) * 100

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
            Earnings are based on quotes marked as paid in this app. Amounts
            show the seller’s target INR for completed payments.
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
            {monthly.map((item) => (
              <button
                key={item.month}
                type="button"
                onClick={() => setSelectedMonth(item.month)}
                aria-pressed={item.month === selected.month}
                className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition ${
                  item.month === selected.month
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

          <div className="mt-8 space-y-3 rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9AA8BC]">
                Completed earnings
              </span>

              <span className="text-sm font-semibold text-white">
                {formatINR(earnings.completed_inr)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9AA8BC]">
                Pending quotes
              </span>

              <span className="text-sm font-semibold text-white">
                {formatINR(earnings.pending_inr)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9AA8BC]">
                Completed payments
              </span>

              <span className="text-sm font-semibold text-white">
                {earnings.completed_count}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9AA8BC]">
                Open quotes
              </span>

              <span className="text-sm font-semibold text-white">
                {earnings.pending_count}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}