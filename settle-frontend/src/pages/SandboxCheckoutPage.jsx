import { useState } from 'react'
import { CreditCard, Lock, ArrowRight } from 'lucide-react'

export default function SandboxCheckoutPage() {
  const [clientPrice, setClientPrice] = useState('189.99')
  const [message, setMessage] = useState('')

  function handlePriceChange(event) {
    setClientPrice(event.target.value)
    setMessage('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    const price = Number(clientPrice)

    if (
      clientPrice.trim() === '' ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setMessage('Enter a client price greater than zero.')
      return
    }

    setMessage('Sandbox checkout preview is ready.')
  }

  return (
    <section className="max-w-6xl">
      <p className="text-xs uppercase tracking-[0.18em] text-[#9AA8BC]">
        Sandbox checkout
      </p>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Preview a fixed client price.
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-[#9AA8BC]">
        See how a fixed USD price could appear before checkout. This is a
        design preview only and does not process a real payment.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#29354D] bg-[#141D33] p-7 sm:p-9"
        >
          <label
            htmlFor="sandbox-client-price"
            className="block text-sm font-medium text-[#DCE4F0]"
          >
            Fixed client price
          </label>

          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#29354D] bg-[#10172A] px-5 py-4 focus-within:border-[#F5A623]">
            <span className="text-2xl font-semibold text-[#9AA8BC]">
              $
            </span>

            <input
              id="sandbox-client-price"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={clientPrice}
              onChange={handlePriceChange}
              aria-describedby="sandbox-price-help"
              className="w-full bg-transparent text-3xl font-semibold text-white outline-none [font-variant-numeric:tabular-nums]"
            />
          </div>

          <p
            id="sandbox-price-help"
            className="mt-3 text-sm text-[#9AA8BC]"
          >
            Enter a USD amount without a currency symbol, such as 189.99.
          </p>

          <button
            type="submit"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-6 py-4 text-base font-semibold text-[#0B1020] transition hover:bg-[#FFB843] sm:w-auto"
          >
            Preview checkout
            <ArrowRight size={18} />
          </button>

          {message ? (
            <p
              role="status"
              className="mt-5 rounded-xl border border-[#29354D] bg-[#10172A] px-4 py-3 text-sm text-[#DCE4F0]"
            >
              {message}
            </p>
          ) : null}
        </form>

        <div className="rounded-3xl border border-[#29354D] bg-[#141D33] p-7 sm:p-9">
          <div className="inline-flex rounded-2xl border border-[#29354D] bg-[#10172A] p-4 text-[#29D6A0]">
            <CreditCard size={28} />
          </div>

          <h2 className="mt-6 text-2xl font-semibold tracking-tight">
            Client checkout preview
          </h2>

          <div className="mt-6 rounded-2xl border border-[#29354D] bg-[#10172A] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[#9AA8BC]">
              Amount due
            </p>

            <p className="mt-3 text-4xl font-semibold text-white">
              ${clientPrice || '0.00'}
            </p>

            <p className="mt-2 text-sm text-[#9AA8BC]">
              Fixed USD price
            </p>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
            <Lock size={20} className="mt-1 text-[#29D6A0]" />

            <div>
              <p className="text-sm font-medium text-[#DCE4F0]">
                Sandbox preview
              </p>

              <p className="mt-2 text-sm leading-relaxed text-[#9AA8BC]">
                This screen does not connect to a payment provider, charge a
                card, or move money. It is for interface design only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}