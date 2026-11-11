import { useMemo, useState } from 'react'
import { ArrowUpRight, Search, Wallet } from 'lucide-react'
import { formatINR, formatUSD } from '../lib/pricing'

const TRANSACTIONS = [
  {
    id: 'TXN-1042',
    client: 'Northwind Studio',
    country: 'United States',
    amountUsd: 320,
    amountInr: 27840,
    status: 'Completed',
    date: '12 Mar 2026',
  },
  {
    id: 'TXN-1041',
    client: 'Lumen Creative',
    country: 'United Kingdom',
    amountUsd: 180,
    amountInr: 15660,
    status: 'Pending',
    date: '11 Mar 2026',
  },
  {
    id: 'TXN-1040',
    client: 'Atlas Design Co.',
    country: 'Canada',
    amountUsd: 540,
    amountInr: 47070,
    status: 'Completed',
    date: '10 Mar 2026',
  },
  {
    id: 'TXN-1039',
    client: 'Bright Path Labs',
    country: 'United States',
    amountUsd: 95,
    amountInr: 8280,
    status: 'Failed',
    date: '09 Mar 2026',
  },
  {
    id: 'TXN-1038',
    client: 'Nova Studio',
    country: 'Australia',
    amountUsd: 260,
    amountInr: 22670,
    status: 'Completed',
    date: '08 Mar 2026',
  },
]

const STATUS_STYLES = {
  Completed: 'border-[#29D6A0]/40 bg-[#29D6A0]/10 text-[#29D6A0]',
  Pending: 'border-[#F5A623]/40 bg-[#F5A623]/10 text-[#F5A623]',
  Failed: 'border-red-500/40 bg-red-500/10 text-red-300',
}

const FILTERS = ['All', 'Completed', 'Pending', 'Failed']

export default function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase()

    return TRANSACTIONS.filter((transaction) => {
      const matchesStatus =
        status === 'All' || transaction.status === status

      const matchesSearch =
        !query ||
        transaction.client.toLowerCase().includes(query) ||
        transaction.id.toLowerCase().includes(query) ||
        transaction.country.toLowerCase().includes(query)

      return matchesStatus && matchesSearch
    })
  }, [search, status])

  return (
    <section className="mx-auto max-w-6xl">
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-full border border-[#29354D] bg-[#141D33] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#9AA8BC]">
          Transactions
        </span>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
          Your payment history.
        </h1>

        <p className="mt-5 text-lg leading-relaxed text-[#9AA8BC]">
          A frontend preview of recent international payments, with search
          and status filters.
        </p>
      </div>

      <div className="mt-12 rounded-[28px] border border-[#29354D] bg-[#141D33] p-7 sm:p-9">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA8BC]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search client, ID, or country"
              aria-label="Search transactions"
              className="w-full rounded-2xl border border-[#29354D] bg-[#10172A] py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-[#9AA8BC] focus:border-[#F5A623] focus:bg-[#0B1020]"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatus(filter)}
                aria-pressed={status === filter}
                className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                  status === filter
                    ? 'border-[#F5A623] bg-[#F5A623] text-[#0B1020]'
                    : 'border-[#29354D] bg-[#10172A] text-[#DCE4F0] hover:border-[#F5A623] hover:bg-[#19243B]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-[#29354D] text-xs uppercase tracking-[0.12em] text-[#9AA8BC]">
                <th className="pb-4 pr-4 font-medium">Client</th>
                <th className="pb-4 pr-4 font-medium">Transaction</th>
                <th className="pb-4 pr-4 font-medium">Amount</th>
                <th className="pb-4 pr-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-[#29354D]/60 transition hover:bg-[#10172A]"
                >
                  <td className="py-5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#29354D] bg-[#10172A]">
                        <Wallet
                          size={20}
                          className="text-[#F5A623]"
                        />
                      </div>

                      <div>
                        <p className="font-semibold text-white">
                          {transaction.client}
                        </p>

                        <p className="text-sm text-[#9AA8BC]">
                          {transaction.country}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-5 pr-4 text-sm text-[#9AA8BC]">
                    {transaction.id}
                  </td>

                  <td className="py-5 pr-4">
                    <p className="font-semibold text-white">
                      {formatUSD(transaction.amountUsd)}
                    </p>

                    <p className="text-sm text-[#9AA8BC]">
                      {formatINR(transaction.amountInr)}
                    </p>
                  </td>

                  <td className="py-5 pr-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[transaction.status]}`}
                    >
                      {transaction.status}
                    </span>
                  </td>

                  <td className="py-5 text-sm text-[#9AA8BC]">
                    {transaction.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-[#29354D] bg-[#10172A] p-10 text-center">
              <ArrowUpRight
                size={32}
                className="mx-auto text-[#9AA8BC]"
              />

              <p className="mt-4 text-lg font-semibold text-white">
                No transactions found
              </p>

              <p className="mt-2 text-sm text-[#9AA8BC]">
                Try a different search term or status filter.
              </p>
            </div>
          ) : null}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-[#9AA8BC]">
          Frontend preview with sample data. Transaction records are not
          connected to a live payment provider or backend.
        </p>
      </div>
    </section>
  )
}