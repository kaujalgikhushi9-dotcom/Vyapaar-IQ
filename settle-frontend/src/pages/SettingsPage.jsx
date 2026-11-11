import { useState } from 'react'
import { Check, Settings, ShieldCheck } from 'lucide-react'

const CUSHION_OPTIONS = [0, 3, 5, 10]

export default function SettingsPage() {
  const [workspaceName, setWorkspaceName] = useState('My Vyapaar IQ Workspace')
  const [defaultCushion, setDefaultCushion] = useState(3)
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(true)
  const [message, setMessage] = useState('')

  function handleWorkspaceChange(event) {
    setWorkspaceName(event.target.value)
    setMessage('')
  }

  function handleCushionChange(value) {
    setDefaultCushion(value)
    setMessage('')
  }

  function handleBreakdownChange(event) {
    setShowDetailedBreakdown(event.target.checked)
    setMessage('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (workspaceName.trim() === '') {
      setMessage('Enter a workspace name.')
      return
    }

    setMessage('Preferences saved locally for this preview.')
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-full border border-[#29354D] bg-[#141D33] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#9AA8BC]">
          Settings
        </span>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
          Workspace preferences.
        </h1>

        <p className="mt-5 text-lg leading-relaxed text-[#9AA8BC]">
          Choose how Vyapaar IQ presents pricing and calculation details. These
          preferences are stored locally in this preview.
        </p>
      </div>

      <div className="mt-12 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-[#29354D] bg-[#141D33] p-7 sm:p-9"
        >
          <div>
            <label
              htmlFor="workspace-name"
              className="block text-sm font-medium text-[#DCE4F0]"
            >
              Workspace name
            </label>

            <input
              id="workspace-name"
              type="text"
              value={workspaceName}
              onChange={handleWorkspaceChange}
              placeholder="My Vyapaar IQ Workspace"
              className="mt-3 w-full rounded-2xl border border-[#29354D] bg-[#10172A] px-5 py-4 text-lg text-white outline-none transition placeholder:text-[#9AA8BC] focus:border-[#F5A623] focus:bg-[#0B1020]"
            />
          </div>

          <fieldset className="mt-8">
            <legend className="text-sm font-medium text-[#DCE4F0]">
              Default currency-movement cushion
            </legend>

            <div className="mt-4 flex flex-wrap gap-3">
              {CUSHION_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleCushionChange(value)}
                  aria-pressed={defaultCushion === value}
                  className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                    defaultCushion === value
                      ? 'border-[#F5A623] bg-[#F5A623] text-[#0B1020]'
                      : 'border-[#29354D] bg-[#10172A] text-[#DCE4F0] hover:border-[#F5A623] hover:bg-[#19243B]'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#9AA8BC]">
              The default cushion is a pricing allowance for exchange-rate
              changes. It is not a guaranteed Vyapaar IQment.
            </p>
          </fieldset>

          <div className="mt-8 flex items-start justify-between gap-6 rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
            <div>
              <p className="text-sm font-medium text-[#DCE4F0]">
                Show detailed calculation breakdown
              </p>

              <p className="mt-2 text-sm leading-relaxed text-[#9AA8BC]">
                Display payment, conversion, and cushion details alongside
                pricing results.
              </p>
            </div>

            <label className="inline-flex shrink-0 cursor-pointer items-center">
              <input
                type="checkbox"
                checked={showDetailedBreakdown}
                onChange={handleBreakdownChange}
                className="peer sr-only"
              />

              <span className="relative inline-flex h-7 w-12 items-center rounded-full border border-[#29354D] bg-[#0B1020] transition peer-checked:border-[#29D6A0] peer-checked:bg-[#29D6A0]">
                <span className="absolute left-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-6 py-4 text-base font-semibold text-[#0B1020] transition hover:bg-[#FFB843] sm:w-auto"
          >
            <Settings size={18} />
            Save preferences
          </button>

          {message ? (
            <p
              role="status"
              className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                message === 'Enter a workspace name.'
                  ? 'border-red-500/40 bg-red-500/10 text-red-300'
                  : 'border-[#29D6A0]/40 bg-[#29D6A0]/10 text-[#29D6A0]'
              }`}
            >
              {message}
            </p>
          ) : null}
        </form>

        <aside className="rounded-[28px] border border-[#29354D] bg-[#141D33] p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#29354D] bg-[#0B1020]">
            <ShieldCheck size={22} className="text-[#F5A623]" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-white">
            Transparent by default
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-[#9AA8BC]">
            Vyapaar IQ separates the client-facing price from the estimated
            Vyapaar IQment path, so every pricing decision remains clear.
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-[#29354D] bg-[#0B1020] p-4">
              <p className="text-sm font-medium text-[#DCE4F0]">
                Current cushion
              </p>

              <p className="mt-1 text-2xl font-semibold text-white">
                {defaultCushion}%
              </p>
            </div>

            <div className="rounded-2xl border border-[#29354D] bg-[#0B1020] p-4">
              <p className="text-sm font-medium text-[#DCE4F0]">
                Detailed breakdown
              </p>

              <p className="mt-1 text-2xl font-semibold text-white">
                {showDetailedBreakdown ? 'On' : 'Off'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}