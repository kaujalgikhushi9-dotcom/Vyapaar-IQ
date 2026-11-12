import { useEffect, useState } from 'react'
import { Receipt, RefreshCw } from 'lucide-react'

function formatINR(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function formatUSD(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value || 0)
}

function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusClass(status) {
  if (status === 'paid') {
    return 'border-[#29D6A0]/40 bg-[#29D6A0]/10 text-[#29D6A0]'
  }

  if (status === 'expired') {
    return 'border-[#F5A623]/40 bg-[#F5A623]/10 text-[#F5A623]'
  }

  return 'border-[#29354D] bg-[#10172A] text-[#9AA8BC]'
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadTransactions() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        'http://localhost:3000/api/transactions',
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not load transactions')
      }

      setTransactions(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  return (
    <section className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#9AA8BC]">
            Transactions
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Track every quote.
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-[#9AA8BC]">
            Review created quotes, payment status, and estimated INR targets.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTransactions}
          className="inline-flex items-center gap-2 rounded-xl border border-[#29354D] bg-[#10172A] px-4 py-3 text-sm font-medium text-[#DCE4F0] transition hover:bg-[#19243B]"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-7">
          <h2 className="text-xl font-semibold text-red-300">
            Could not load transactions
          </h2>

          <p className="mt-3 text-[#9AA8BC]">{error}</p>
        </div>
      )}

      {loading && !error && (
        <div className="mt-8 rounded-3xl border border-[#29354D] bg-[#141D33] p-7">
          <p className="text-[#9AA8BC]">Loading transactions…</p>
        </div>
      )}

      {!loading && !error && transactions.length === 0 && (
        <div className="mt-8 rounded-3xl border border-[#29354D] bg-[#141D33] p-7">
          <div className="inline-flex rounded-2xl border border-[#29354D] bg-[#10172A] p-4 text-[#F5A623]">
            <Receipt size={28} />
          </div>

          <h2 className="mt-6 text-2xl font-semibold text-white">
            No transactions yet
          </h2>

          <p className="mt-3 text-[#9AA8BC]">
            Create a quote in Smart Pricing to see it appear here.
          </p>
        </div>
      )}

      {!loading && !error && transactions.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-3xl border border-[#29354D] bg-[#141D33]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-[#29354D] text-xs uppercase tracking-[0.14em] text-[#9AA8BC]">
                  <th className="px-6 py-5">Quote</th>
                  <th className="px-6 py-5">INR target</th>
                  <th className="px-6 py-5">Client price</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Created</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-[#29354D]/60 last:border-0"
                  >
                    <td className="px-6 py-5">
                      <p className="font-mono text-sm text-[#DCE4F0]">
                        {transaction.id}
                      </p>

                      <p className="mt-1 text-xs text-[#9AA8BC]">
                        {transaction.order_id
                          ? `PayPal order: ${transaction.order_id}`
                          : 'No PayPal order created'}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-white">
                      {formatINR(transaction.seller_inr_target)}
                    </td>

                    <td className="px-6 py-5 text-sm text-[#DCE4F0]">
                      {formatUSD(transaction.buyer_price)}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusClass(
                          transaction.status,
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-[#9AA8BC]">
                      {formatDate(transaction.locked_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}