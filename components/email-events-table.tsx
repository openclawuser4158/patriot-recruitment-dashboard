'use client'

import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { EmailEvent } from '@/lib/email-events'

interface EmailEventsTableProps {
  events: EmailEvent[]
  maxItems?: number
}

const eventBadge = (type: string) => {
  const styles: Record<string, string> = {
    delivered: 'bg-green-100 text-green-800',
    accepted: 'bg-green-50 text-green-700',
    opened: 'bg-blue-100 text-blue-800',
    clicked: 'bg-purple-100 text-purple-800',
    bounced: 'bg-red-100 text-red-700',
    failed: 'bg-red-100 text-red-700',
    complained: 'bg-orange-100 text-orange-800',
    unsubscribed: 'bg-yellow-100 text-yellow-800',
    stored: 'bg-gray-100 text-gray-700',
    replied: 'bg-teal-100 text-teal-800',
  }
  return styles[type] || 'bg-gray-100 text-gray-600'
}

function redactEmail(email: string): string {
  if (!email || !email.includes('@')) return email || '—'
  const [local, domain] = email.split('@')
  if (local.length <= 2) return `${local}***@${domain}`
  return `${local.slice(0, 2)}***@${domain}`
}

export function EmailEventsTable({ events, maxItems = 100 }: EmailEventsTableProps) {
  const items = events.slice(0, maxItems)

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-[#6B7280] text-sm">
        No email events found for the selected filters
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Event
            </th>
            <th className="text-left py-3 px-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Recipient
            </th>
            <th className="text-left py-3 px-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#6B7280] hidden sm:table-cell">
              Subject
            </th>
            <th className="text-left py-3 px-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#6B7280] hidden md:table-cell">
              Agent
            </th>
            <th className="text-right py-3 px-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((event) => (
            <tr key={event.id} className="hover:bg-gray-50/70 transition-colors">
              <td className="py-3 px-3">
                <span className={cn(
                  'inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium capitalize',
                  eventBadge(event.event_type)
                )}>
                  {event.event_type}
                </span>
              </td>
              <td className="py-3 px-3 text-xs sm:text-sm text-gray-700 max-w-[120px] sm:max-w-none truncate">
                {redactEmail(event.recipient)}
              </td>
              <td className="py-3 px-3 text-xs sm:text-sm text-gray-600 max-w-[200px] truncate hidden sm:table-cell">
                {event.subject || '—'}
              </td>
              <td className="py-3 px-3 text-xs sm:text-sm text-gray-600 capitalize hidden md:table-cell">
                {event.agent || '—'}
              </td>
              <td className="py-3 px-3 text-right text-xs text-[#6B7280] whitespace-nowrap">
                {formatRelativeTime(event.timestamp)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
