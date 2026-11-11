import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calculator,
  History,
  MessagesSquare,
  Menu,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const mobileLinks = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/pricing', label: 'Price', icon: Calculator },
  { path: '/transactions', label: 'History', icon: History },
  { path: '/assistant', label: 'AI', icon: MessagesSquare },
]

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const dialogRef = useRef(null)
  const mainRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const dialog = dialogRef.current

    if (menuOpen && !dialog.open) dialog.showModal()
    if (!menuOpen && dialog.open) dialog.close()
  }, [menuOpen])

  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.focus()
  }, [pathname])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F5F6FA]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#F5A623] focus:p-3 focus:text-[#0B1020]"
      >
        Skip to page content
      </a>

      <Sidebar />

      <dialog
        ref={dialogRef}
        aria-label="Workspace navigation"
        onCancel={closeMenu}
        onClose={closeMenu}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[90vw] border-0 bg-[#10172A] p-0 text-[#F5F6FA] backdrop:bg-black/60"
      >
        <Sidebar mobile onClose={closeMenu} />
      </dialog>

      <div className="lg:pl-72">
        <Header onOpenMenu={() => setMenuOpen(true)} />

        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="mx-auto max-w-[1440px] px-5 py-8 pb-28 outline-none sm:px-8 lg:py-10 lg:pb-12"
        >
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#29354D] bg-[#10172A] pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {mobileLinks.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] ${
                isActive ? 'text-[#F5A623]' : 'text-[#9AA8BC]'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] text-[#9AA8BC]"
        >
          <Menu size={20} />
          More
        </button>
      </nav>
    </div>
  )
}