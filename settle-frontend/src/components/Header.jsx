import { NavLink, useLocation } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'
import { allPages } from '../data/navigation'

export default function Header({ onOpenMenu }) {
  const { pathname } = useLocation()
  const page = allPages.find((item) => item.path === pathname)

  return (
    <header className="sticky top-0 z-20 border-b border-[#29354D] bg-[#0B1020]">
      <div className="flex min-h-20 items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-[#9AA8BC] hover:bg-[#19243B] lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9AA8BC]">
              Your workspace
            </p>
            <p className="truncate text-sm font-medium">
              {page?.label ?? 'Vyapaar IQ'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden rounded-full border border-[#29354D] px-3 py-1.5 text-xs text-[#9AA8BC] sm:inline-flex">
            Prototype · No live data
          </span>

          <NavLink
            to="/notifications"
            aria-label="Open notifications"
            className="rounded-xl border border-[#29354D] p-3 text-[#9AA8BC] hover:bg-[#19243B] hover:text-[#F5F6FA]"
          >
            <Bell size={18} />
          </NavLink>
        </div>
      </div>
    </header>
  )
}