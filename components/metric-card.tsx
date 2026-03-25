import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: string
    positive?: boolean
  }
  className?: string
  accent?: 'red' | 'navy' | 'green' | 'default'
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  accent = 'default',
}: MetricCardProps) {
  const accentColors = {
    red: 'border-t-[#C41E3A]',
    navy: 'border-t-[#1B2A4A]',
    green: 'border-t-emerald-500',
    default: 'border-t-[#6B7280]',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 p-4 sm:p-5 flex flex-col gap-2 sm:gap-3',
        accentColors[accent],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#6B7280] leading-tight">
            {title}
          </div>
        </div>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-[#F5F7FA] flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-[#6B7280]" />
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 leading-none">{value}</div>
        {subtitle && (
          <div className="text-sm text-[#6B7280] mt-1">{subtitle}</div>
        )}
      </div>
      {trend && (
        <div
          className={cn(
            'text-xs font-medium flex items-center gap-1',
            trend.positive ? 'text-emerald-600' : 'text-red-600'
          )}
        >
          <span>{trend.positive ? '↑' : '↓'}</span>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  )
}
