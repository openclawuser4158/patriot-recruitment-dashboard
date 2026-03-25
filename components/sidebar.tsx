'use client'

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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-[#1B2A4A] text-white h-screen overflow-y-auto">
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
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-[#C41E3A] text-white shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
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
    </aside>
  )
}
