import { useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'

const INITIAL_NOTIFICATIONS = [
  {
    id: 'rate-alert',
    title: 'USD–INR reference rate moved',
    description:
      'The illustrative USD–INR reference rate changed. Review your pricing cushion before quoting a new client price.',
    time: '12 minutes ago',
    type: 'Rate alert',
  },
  {
    id: 'payment-update',
    title: 'Payment status updated',
    description:
      'A sample payment moved from pending to completed in the transaction preview.',
    time: '2 hours ago',
    type: 'Payment',
  },
  {
    id: 'pricing-reminder',
    title: 'Review your cushion choice',
    description:
      'Your current default cushion is 3%. Consider reviewing it before sending your next fixed-price quote.',
    time: 'Yesterday',
    type: 'Pricing',
  },
  {
    id: 'leakage-insight',
    title: 'Cost breakdown available',
    description:
      'Your estimated payment and conversion costs are available in Leakage Analysis.',
    time: '2 days ago',
    type: 'Insight',
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(
    INITIAL_NOTIFICATIONS,
  )
  const [message, setMessage] = useState('')

  function markAllRead() {
    setNotifications([])
    setMessage('All notifications cleared for this preview.')
  }

  return (
    <section className="max-w-4xl">
      <p className="text-xs uppercase tracking-[0.18em] text-[#9AA8BC]">
        Notifications
      </p>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Stay informed.
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-[#9AA8BC]">
        Review rate alerts, payment updates, and pricing reminders in one
        place.
      </p>

      <div className="mt-10 flex items-center justify-between gap-4 rounded-3xl border border-[#29354D] bg-[#141D33] p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="inline-flex rounded-2xl border border-[#29354D] bg-[#10172A] p-4 text-[#F5A623]">
            <Bell size={24} />
          </div>

          <div>
            <p className="text-lg font-semibold text-white">
              {notifications.length} active updates
            </p>

            <p className="mt-1 text-sm text-[#9AA8BC]">
              Sample notifications for interface preview.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={markAllRead}
          className="inline-flex items-center gap-2 rounded-xl border border-[#29354D] px-5 py-3 text-sm font-medium text-[#DCE4F0] transition hover:bg-[#19243B]"
        >
          <CheckCheck size={18} />
          Mark all read
        </button>
      </div>

      {message ? (
        <p
          role="status"
          className="mt-5 rounded-xl border border-[#29354D] bg-[#10172A] px-4 py-3 text-sm text-[#DCE4F0]"
        >
          {message}
        </p>
      ) : null}

      <div className="mt-8 space-y-4">
        {notifications.length === 0 ? (
          <div className="rounded-3xl border border-[#29354D] bg-[#141D33] p-10 text-center">
            <p className="text-lg font-semibold text-white">
              You’re all caught up.
            </p>

            <p className="mt-2 text-sm text-[#9AA8BC]">
              No active notifications in this preview.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <article
              key={notification.id}
              className="rounded-3xl border border-[#29354D] bg-[#141D33] p-6 sm:p-7"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full border border-[#29354D] bg-[#10172A] px-3 py-1 text-xs font-medium text-[#F5A623]">
                  {notification.type}
                </span>

                <span className="text-xs text-[#9AA8BC]">
                  {notification.time}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-semibold tracking-tight text-white">
                {notification.title}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-[#9AA8BC]">
                {notification.description}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}