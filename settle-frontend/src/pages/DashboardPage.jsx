import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Calculator,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'


const QUICK_ACTIONS = [
  {
    to: '/pricing',
    icon: Calculator,
    title: 'Start with the rupees',
    description:
      'Enter the INR you want to receive and estimate a fixed client price.',
    cta: 'Open Smart Pricing',
  },
  {
    to: '/buffer-studio',
    icon: ShieldCheck,
    title: 'Choose your cushion',
    description:
      'Compare currency-movement cushions and their effect on pricing.',
    cta: 'Open Buffer Studio',
  },
  {
    to: '/hisaab',
    icon: ReceiptText,
    title: 'See your hisaab',
    description:
      'Review estimated deductions and the journey from client price to INR.',
    cta: 'Open Your Hisaab',
  },
]


const ACTIVITY_ITEMS = [
  {
    title: 'USD–INR reference rate moved',
    description:
      'Review your currency-movement cushion before quoting a new price.',
    time: '12 minutes ago',
    to: '/notifications',
  },
  {
    title: 'Payment status updated',
    description: 'A sample payment moved from pending to completed.',
    time: '2 hours ago',
    to: '/transactions',
  },
  {
    title: 'Cost breakdown available',
    description:
      'Review estimated payment and conversion costs in Leakage Analysis.',
    time: '2 days ago',
    to: '/leakage',
  },
]


const WORKSPACE_FACTS = [
  {
    label: 'Currency',
    value: 'USD only',
    detail:
      'A focused first version for international client pricing.',
  },
  {
    label: 'Pricing model',
    value: 'Fixed client price',
    detail:
      'Set a price before checkout rather than accepting uncertain conversion outcomes.',
  },
  {
    label: 'Data status',
    value: 'Illustrative',
    detail:
      'Sample data and assumptions—not live rates or guaranteed Vyapaar IQment.',
  },
]


export default function DashboardPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-10">
      <div className="relative overflow-hidden rounded-[28px] border border-[#29354D] bg-[#10172A] p-8 sm:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#F5A623]/10 blur-3xl"
        />


        <div className="relative">
          <span className="inline-flex items-center rounded-full border border-[#29354D] bg-[#141D33] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#9AA8BC]">
            Vyapaar IQ workspace
          </span>


          <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
            Price international work with Vyapaar IQ.
          </h1>


          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#9AA8BC]">
            Start with the rupees you want to receive, understand the
            estimated costs in between, and choose a currency-movement
            cushion before quoting a client.
          </p>


          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/pricing"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#F5A623] px-6 py-4 text-base font-semibold text-[#0B1020] transition hover:bg-[#FFB843]"
            >
              Start Smart Pricing


              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </Link>


            <Link
              to="/buffer-studio"
              className="inline-flex items-center gap-2 rounded-xl border border-[#29354D] bg-[#141D33] px-6 py-4 text-base font-medium text-[#DCE4F0] transition hover:border-[#F5A623] hover:bg-[#19243B]"
            >
              Compare cushions
            </Link>
          </div>


          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {WORKSPACE_FACTS.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[#29354D] bg-[#141D33] p-5 transition hover:border-[#F5A623]/50"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-[#9AA8BC]">
                  {item.label}
                </p>


                <p className="mt-3 text-xl font-semibold text-white">
                  {item.value}
                </p>


                <p className="mt-2 text-sm leading-relaxed text-[#9AA8BC]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>


      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Start where it matters
            </h2>


            <p className="mt-2 text-[#9AA8BC]">
              Move from target INR to a clearer client-facing price.
            </p>
          </div>
        </div>


        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon


            return (
              <Link
                key={action.to}
                to={action.to}
                className="group rounded-[24px] border border-[#29354D] bg-[#141D33] p-7 transition duration-200 hover:-translate-y-1 hover:border-[#F5A623]/70 hover:bg-[#19243B]"
              >
                <div className="inline-flex rounded-2xl border border-[#29354D] bg-[#10172A] p-4 text-[#F5A623]">
                  <Icon size={24} />
                </div>


                <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">
                  {action.title}
                </h3>


                <p className="mt-3 text-sm leading-relaxed text-[#9AA8BC]">
                  {action.description}
                </p>


                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#F5A623]">
                  {action.cta}


                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </Link>
            )
          })}
        </div>
      </div>


      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="rounded-[24px] border border-[#29354D] bg-[#141D33] p-7 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Recent activity
              </h2>


              <p className="mt-2 text-[#9AA8BC]">
                A quick view of updates across your workspace.
              </p>
            </div>


            <Link
              to="/notifications"
              className="inline-flex items-center gap-2 rounded-xl border border-[#29354D] px-4 py-3 text-sm text-[#DCE4F0] transition hover:border-[#F5A623] hover:bg-[#19243B]"
            >
              <Bell size={16} />
              View all
            </Link>
          </div>


          <div className="mt-7 space-y-4">
            {ACTIVITY_ITEMS.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="block rounded-2xl border border-[#29354D] bg-[#10172A] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#F5A623]/70 hover:bg-[#19243B]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-[#DCE4F0]">
                    {item.title}
                  </p>


                  <span className="text-xs text-[#9AA8BC]">
                    {item.time}
                  </span>
                </div>


                <p className="mt-2 text-sm leading-relaxed text-[#9AA8BC]">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>


        <div className="rounded-[24px] border border-[#29354D] bg-[#141D33] p-7 sm:p-9">
          <div className="inline-flex rounded-2xl border border-[#29354D] bg-[#10172A] p-4 text-[#29D6A0]">
            <TrendingUp size={28} />
          </div>


          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white">
            Earnings direction
          </h2>


          <p className="mt-3 text-[#9AA8BC]">
            Review the monthly trend and identify changes in estimated
            earnings.
          </p>


          <Link
            to="/earnings"
            className="mt-7 inline-flex items-center gap-2 rounded-xl border border-[#29354D] px-5 py-3 text-sm font-medium text-[#DCE4F0] transition hover:border-[#F5A623] hover:bg-[#19243B]"
          >
            Open Earnings Overview
          </Link>


          <div className="mt-8 rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#9AA8BC]">
              Important
            </p>


            <p className="mt-3 text-sm leading-relaxed text-[#9AA8BC]">
              Vyapaar IQ provides planning and interface previews. It does
              not guarantee Vyapaar IQment, provide financial advice, or connect
              to live payment accounts.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}