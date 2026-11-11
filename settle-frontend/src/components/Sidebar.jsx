import { NavLink } from 'react-router-dom'
import { IndianRupee, X } from 'lucide-react'
import { navigation } from '../data/navigation'

export default function Sidebar({ mobile = false, onClose }) {
  return (
    <aside
      aria-label="Main navigation"
      className={`flex h-full w-72 flex-col border-r border-[#29354D] bg-[#10172A] ${
        mobile ? '' : 'fixed inset-y-0 left-0 z-30 hidden lg:flex'
      }`}
    >
      <div className="flex h-24 shrink-0 items-center justify-between px-7">
        <NavLink
          to="/dashboard"
          onClick={onClose}
          aria-label="Vyapaar IQ dashboard"
          className="flex items-center gap-3"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#F5A623] text-[#0B1020]">
            <IndianRupee size={23} strokeWidth={2.5} />
          </span>

          <span className="text-2xl font-semibold tracking-tight">
            Vyapaar IQ<span className="text-[#F5A623]">.</span>
          </span>
        </NavLink>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-[#9AA8BC] hover:bg-[#19243B]"
          >
            <X size={21} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-4 pb-6">
        {navigation.map((group) => (
          <section key={group.label}>
            <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9AA8BC]">
              {group.label}
            </h2>

            <div className="space-y-1">
              {group.items.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-colors ${
                      isActive
                        ? 'border-[#F5A623]/20 bg-[#F5A623]/10 text-[#F5A623]'
                        : 'border-transparent text-[#9AA8BC] hover:bg-[#19243B] hover:text-[#F5F6FA]'
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[#29354D] p-5">
        <NavLink
          to="/settings"
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl p-2 hover:bg-[#19243B]"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-[#19243B] text-sm font-semibold text-[#F5A623]">
            M
          </span>

          <span>
            <span className="block text-sm font-medium">
              Merchant workspace
            </span>
            <span className="block text-xs text-[#9AA8BC]">
              Local prototype · No account connected
            </span>
          </span>
        </NavLink>
      </div>
    </aside>
  )
}