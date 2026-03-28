'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const EVENT_TYPES = ['delivered', 'accepted', 'opened', 'clicked', 'bounced', 'failed', 'complained', 'unsubscribed', 'stored']
const AGENTS = ['tyler', 'madison', 'colton', 'harper', 'brooke', 'sam', 'system']
const DATE_RANGES = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 14 days', value: '14' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 60 days', value: '60' },
  { label: 'Last 90 days', value: '90' },
]

interface EmailFiltersProps {
  currentEventType?: string
  currentAgent?: string
  currentDays?: string
  currentRecipient?: string
}

export function EmailFilters({ currentEventType, currentAgent, currentDays, currentRecipient }: EmailFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/dashboard/email-analytics?${params.toString()}`)
    },
    [router, searchParams]
  )

  const hasFilters = currentEventType || currentAgent || currentRecipient || (currentDays && currentDays !== '30')

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      <select
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 min-h-[44px] sm:min-h-0 sm:py-1.5"
        value={currentDays ?? '30'}
        onChange={(e) => updateFilter('days', e.target.value)}
      >
        {DATE_RANGES.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      <select
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 min-h-[44px] sm:min-h-0 sm:py-1.5"
        value={currentEventType ?? ''}
        onChange={(e) => updateFilter('event', e.target.value)}
      >
        <option value="">All Events</option>
        {EVENT_TYPES.map((t) => (
          <option key={t} value={t} className="capitalize">{t}</option>
        ))}
      </select>

      <select
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 min-h-[44px] sm:min-h-0 sm:py-1.5"
        value={currentAgent ?? ''}
        onChange={(e) => updateFilter('agent', e.target.value)}
      >
        <option value="">All Agents</option>
        {AGENTS.map((a) => (
          <option key={a} value={a} className="capitalize">{a}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Filter by recipient…"
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 min-h-[44px] sm:min-h-0 sm:py-1.5 w-full sm:w-48"
        defaultValue={currentRecipient ?? ''}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            updateFilter('recipient', (e.target as HTMLInputElement).value)
          }
        }}
        onBlur={(e) => {
          if (e.target.value !== (currentRecipient ?? '')) {
            updateFilter('recipient', e.target.value)
          }
        }}
      />

      {hasFilters && (
        <button
          onClick={() => router.push('/dashboard/email-analytics')}
          className="text-xs text-[#C41E3A] hover:underline whitespace-nowrap"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
