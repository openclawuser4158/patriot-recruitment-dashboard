'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  GitBranch,
  Briefcase,
  Activity,
  DollarSign,
  Users,
  Building2,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/pipeline', label: 'Pipeline', icon: GitBranch },
  { href: '/dashboard/mandates', label: 'Mandates', icon: Briefcase },
  { href: '/dashboard/activity', label: 'Activity', icon: Activity },
  { href: '/dashboard/revenue', label: 'Revenue', icon: DollarSign },
  { href: '/dashboard/agents', label: 'Agents', icon: Users },
]

function NavContent({ pathname, onNavClick }: { pathname: string; onNavClick?: () => void }) {
  return (
    <>
      {/* Logo / Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#C41E3A] flex items-center justify-center flex-shrink-0">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">Patriot Recruitment</div>
            <div className="text-xs text-white/50 leading-tight">CRM Dashboard</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 mb-3">
          Navigation
        </div>
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-[#C41E3A] text-white shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10 active:bg-white/10'
              )}
            >
              <item.icon size={18} className="flex-shrink-0" />
              <span>{item.label}</span>
              {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <div className="text-xs text-white/30 text-center">
          Construction Recruitment AI
        </div>
        <div className="text-xs text-white/20 text-center mt-0.5">
          v1.0.0
        </div>
      </div>
    </>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7FA]">
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col bg-[#1B2A4A] text-white h-screen overflow-y-auto">
        <NavContent pathname={pathname} />
      </aside>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-72 max-w-[85vw] flex flex-col bg-[#1B2A4A] text-white h-full overflow-y-auto shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/20 text-white"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <NavContent pathname={pathname} onNavClick={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar — hidden on desktop */}
        <header
          className="md:hidden flex items-center gap-3 px-4 bg-[#1B2A4A] text-white flex-shrink-0"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            height: 'calc(56px + env(safe-area-inset-top))',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 rounded-lg hover:bg-white/10 active:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#C41E3A] flex items-center justify-center flex-shrink-0">
              <Building2 size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm">Patriot CRM</span>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

// Keep Sidebar export for backwards compatibility
export { AppShell as Sidebar }
