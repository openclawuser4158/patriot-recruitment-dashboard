'use client'

import { useState } from 'react'
import { statusColor, formatCurrency, daysOpen } from '@/lib/utils'
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MandateRowProps {
  mandate: {
    id: string
    role_title: string
    location_city: string | null
    location_state: string | null
    status: string
    urgency: string | null
    salary_min: number | null
    salary_max: number | null
    created_at: string
    responsibilities: string | null
    fee_percentage: number | null
    client: any
    submissions: any[]
  }
}

const urgencyBadge = (urgency: string | null) => {
  if (!urgency) return null
  const map: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  }
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', map[urgency] ?? 'bg-gray-100 text-gray-600')}>
      {urgency}
    </span>
  )
}

export function MandateRow({ mandate }: MandateRowProps) {
  const [expanded, setExpanded] = useState(false)

  const activeSubs = mandate.submissions?.filter(
    (s: any) => !['rejected', 'withdrawn'].includes(s.status)
  ).length ?? 0

  const days = daysOpen(mandate.created_at)
  const daysClass = days > 60 ? 'text-red-600 font-semibold' : days > 30 ? 'text-orange-600' : 'text-gray-700'

  return (
    <>
      <tr
        className="border-b border-gray-50 hover:bg-[#F5F7FA] cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
            <div>
              <div className="text-sm font-semibold text-gray-900">{mandate.client?.company_name}</div>
              <div className="text-xs text-[#6B7280]">{mandate.role_title}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin size={12} className="text-gray-400 flex-shrink-0" />
            <span className="text-xs">{mandate.location_city ? `${mandate.location_city}, ${mandate.location_state}` : (mandate.location_state ?? '—')}</span>
          </div>
        </td>
        <td className="px-4 py-4">
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', statusColor(mandate.status))}>
            {mandate.status.replace('_', ' ')}
          </span>
        </td>
        <td className="px-4 py-4">
          {urgencyBadge(mandate.urgency)}
        </td>
        <td className={cn('px-4 py-4 text-right text-sm tabular-nums', daysClass)}>
          {days}d
        </td>
        <td className="px-4 py-4 text-right">
          <span className="text-sm font-semibold text-[#1B2A4A]">{activeSubs}</span>
        </td>
        <td className="px-4 py-4 text-sm text-gray-700">
          {mandate.salary_min || mandate.salary_max
            ? `${formatCurrency(mandate.salary_min)} – ${formatCurrency(mandate.salary_max)}`
            : '—'}
        </td>
      </tr>

      {/* Expanded details */}
      {expanded && (
        <tr className="bg-[#F5F7FA] border-b border-gray-100">
          <td colSpan={7} className="px-8 py-4">
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Description</div>
                <p className="text-gray-700 text-xs leading-relaxed">
                  {mandate.responsibilities ?? 'No description provided.'}
                </p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Financials</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Fee %</span>
                    <span className="font-medium text-gray-900">
                      {mandate.fee_percentage != null ? `${mandate.fee_percentage}%` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Salary range</span>
                    <span className="font-medium text-gray-900">
                      {mandate.salary_min || mandate.salary_max
                        ? `${formatCurrency(mandate.salary_min)} – ${formatCurrency(mandate.salary_max)}`
                        : '—'}
                    </span>
                  </div>
                  {mandate.fee_percentage && mandate.salary_max && (
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Est. fee</span>
                      <span className="font-semibold text-[#C41E3A]">
                        {formatCurrency((mandate.salary_max * mandate.fee_percentage) / 100)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Submissions</div>
                <div className="space-y-1 text-xs">
                  {['submitted', 'reviewing', 'interviewing', 'offered', 'placed'].map((s) => {
                    const count = mandate.submissions?.filter((sub: any) => sub.status === s).length ?? 0
                    return count > 0 ? (
                      <div key={s} className="flex justify-between">
                        <span className="text-[#6B7280] capitalize">{s}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
