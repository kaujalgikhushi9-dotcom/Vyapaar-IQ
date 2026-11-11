import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import PricingPage from './pages/PricingPage'
import HisaabPage from './pages/HisaabPage'
import AnalyticsPage from './pages/AnalyticsPage'
import MoneyJourneyPage from './pages/MoneyJourneyPage'
import TransactionsPage from './pages/TransactionsPage'
import ClientsPage from './pages/ClientsPage'
import RateExplorerPage from './pages/RateExplorerPage'
import LeakagePage from './pages/LeakagePage'
import SafetyBufferPage from './pages/SafetyBufferPage'
import SandboxCheckoutPage from './pages/SandboxCheckoutPage'
import AiPage from './pages/AiPage'

import SettingsPage from './pages/SettingsPage'
import EarningsOverviewPage from './pages/EarningsOverviewPage'
import NotificationsPage from './pages/NotificationsPage'
import { allPages } from './data/navigation'

const COMPLETED_ROUTES = [
  '/dashboard',
  '/earnings',
  '/notifications',
  '/pricing',
  '/buffer-studio',
  '/hisaab',
  '/analytics',
  '/money-journey',
  '/transactions',
  '/clients',
  '/rates',
  '/leakage',
  '/checkout',
  '/assistant',
  '/settings',
]

function PageInProgress({ page }) {
  const Icon = page.icon

  return (
    <section className="max-w-3xl">
      <div className="mb-6 inline-flex rounded-2xl border border-[#29354D] bg-[#141D33] p-4 text-[#F5A623]">
        <Icon size={28} />
      </div>

      <p className="text-xs uppercase tracking-[0.18em] text-[#9AA8BC]">
        Application foundation
      </p>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {page.label}
      </h1>

      <p className="mt-4 text-lg text-[#9AA8BC]">
        {page.description}
      </p>

      <div className="mt-8 rounded-2xl border border-[#29354D] bg-[#141D33] p-6">
        <p className="font-medium">
          Route connected. Feature implementation next.
        </p>

        <p className="mt-2 text-sm leading-relaxed text-[#9AA8BC]">
          This temporary screen verifies navigation only. It is not the
          finished page or a connected financial service.
        </p>
      </div>

      <Link
        to="/dashboard"
        className="mt-7 inline-flex rounded-xl border border-[#29354D] px-5 py-3 text-sm hover:bg-[#19243B]"
      >
        Back to dashboard
      </Link>
    </section>
  )
}

function NotFoundPage() {
  return (
    <section className="py-16">
      <p className="text-sm text-[#F5A623]">404</p>
      <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>

      <Link
        to="/dashboard"
        className="mt-6 inline-flex rounded-xl bg-[#F5A623] px-5 py-3 text-[#0B1020]"
      >
        Return to dashboard
      </Link>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="earnings" element={<EarningsOverviewPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="buffer-studio" element={<SafetyBufferPage />} />
          <Route path="hisaab" element={<HisaabPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="money-journey" element={<MoneyJourneyPage />} />
          <Route path="checkout" element={<SandboxCheckoutPage />} />
          <Route path="assistant" element={<AiPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="rates" element={<RateExplorerPage />} />
          <Route path="leakage" element={<LeakagePage />} />
          <Route path="settings" element={<SettingsPage />} />

          {allPages
            .filter((page) => !COMPLETED_ROUTES.includes(page.path))
            .map((page) => (
              <Route
                key={page.path}
                path={page.path.slice(1)}
                element={<PageInProgress page={page} />}
              />
            ))}

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}