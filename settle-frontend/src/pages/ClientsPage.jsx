import { useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { formatINR, formatUSD } from '../lib/pricing'

const CLIENTS = [
  {
    id: 'CLT-001',
    name: 'Northwind Studio',
    country: 'United States',
    currency: 'USD',
    totalPaidUsd: 1240,
    totalPaidInr: 107680,
    transactions: 4,
    status: 'Active',
  },
  {
    id: 'CLT-002',
    name: 'Lumen Creative',
    country: 'United Kingdom',
    currency: 'USD',
    totalPaidUsd: 680,
    totalPaidInr: 59140,
    transactions: 3,
    status: 'Active',
  },
  {
    id: 'CLT-003',
    name: 'Atlas Design Co.',
    country: 'Canada',
    currency: 'USD',
    totalPaidUsd: 1980,
    totalPaidInr: 172230,
    transactions: 6,
    status: 'Active',
  },
  {
    id: 'CLT-004',
    name: 'Bright Path Labs',
    country: 'United States',
    currency: 'USD',
    totalPaidUsd: 320,
    totalPaidInr: 27840,
    transactions: 2,
    status: 'New',
  },
  {
    id: 'CLT-005',
    name: 'Nova Studio',
    country: 'Australia',
    currency: 'USD',
    totalPaidUsd: 860,
    totalPaidInr: 74890,
    transactions: 3,
    status: 'Active',
  },
]

const STATUS_STYLES = {
  Active: 'border-[#29D6A0]/40 bg-[#29D6A0]/10 text-[#29D6A0]',
  New: 'border-[#F5A623]/40 bg-[#F5A623]/10 text-[#F5A623]',
}

export default function ClientsPage() {
  const [search, setSearch] = useState('')

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return CLIENTS
    }

    return CLIENTS.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.country.toLowerCase().includes(query) ||
        client.id.toLowerCase().includes(query),
    )
  }, [search])

  return (
    <section className="mx-auto max-w-6xl">
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-full border border-[#29354D] bg-[#141D33] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#9AA8BC]">
          Clients
        </span>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
          Your international buyers.
        </h1>

        <p className="mt-5 text-lg leading-relaxed text-[#9AA8BC]">
          A frontend preview of your client directory, with search and
          payment-history summaries.
        </p>
      </div>

      <div className="mt-12 rounded-[28px] border border-[#29354D] bg-[#141D33] p-7 sm:p-9">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={20}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA8BC]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search client, country, or ID"
            aria-label="Search clients"
            className="w-full rounded-2xl border border-[#29354D] bg-[#10172A] py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-[#9AA8BC] focus:border-[#F5A623] focus:bg-[#0B1020]"
          />
        </div>

        {filteredClients.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredClients.map((client) => (
              <article
                key={client.id}
                className="rounded-[22px] border border-[#29354D] bg-[#10172A] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#F5A623]/60 hover:bg-[#141D33]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#29354D] bg-[#0B1020]">
                      <Users
                        size={22}
                        className="text-[#F5A623]"
                      />
                    </div>

                    <div>
                      <h2 className="font-semibold leading-snug text-white">
                        {client.name}
                      </h2>

                      <p className="text-sm text-[#9AA8BC]">
                        {client.country}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[client.status]}`}
                  >
                    {client.status}
                  </span>
                </div>

                <div className="mt-7 rounded-2xl border border-[#29354D] bg-[#0B1020] p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#9AA8BC]">
                    Total paid
                  </p>

                  <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {formatUSD(client.totalPaidUsd)}
                  </p>

                  <p className="mt-1 text-sm text-[#9AA8BC]">
                    {formatINR(client.totalPaidInr)} equivalent
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#29354D]/60 pt-5">
                  <span className="text-sm text-[#9AA8BC]">
                    Transactions
                  </span>

                  <span className="font-semibold text-white">
                    {client.transactions}
                  </span>
                </div>

                <p className="mt-5 text-xs text-[#9AA8BC]">
                  {client.id} · {client.currency}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-[#29354D] bg-[#10172A] p-10 text-center">
            <Users
              size={40}
              className="mx-auto text-[#9AA8BC]"
            />

            <h2 className="mt-5 text-xl font-semibold text-white">
              No clients found
            </h2>

            <p className="mt-2 text-sm text-[#9AA8BC]">
              Try a different client name, country, or ID.
            </p>
          </div>
        )}

        <p className="mt-6 text-xs leading-relaxed text-[#9AA8BC]">
          Frontend preview with sample data. Client records are not
          connected to a backend or live payment provider.
        </p>
      </div>
    </section>
  )
}