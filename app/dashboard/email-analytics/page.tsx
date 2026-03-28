'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { subDays, format } from 'date-fns'
import { fetchEmailEvents, computeMetrics, groupEventsByDay } from '@/lib/email-events'
import type { EmailEvent, EmailSummaryMetrics } from '@/lib/email-events'
import { EmailMetricsCards } from '@/components/email-metrics-cards'
import { EmailEventsChart } from '@/components/email-events-chart'
import { EmailEventsTable } from '@/components/email-events-table'
import { EmailFilters } from './email-filters'

function LoadingSpinner() {
  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#6B7280]">Loading email analytics…</p>
      </div>
    </div>
  )
}

function EmailAnalyticsContent() {
  const searchParams = useSearchParams()
  const daysParam = searchParams.get('days') ?? '30'
  const eventType = searchParams.get('event') ?? undefined
  const agent = searchParams.get('agent') ?? undefined
  const recipient = searchParams.get('recipient') ?? undefined

  const [events, setEvents] = useState<EmailEvent[]>([])
  const [metrics, setMetrics] = useState<EmailSummaryMetrics | null>(null)
  const [chartData, setChartData] = useState<{ date: string; sent: number; opened: number; clicked: number; bounced: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const days = parseInt(daysParam) || 30
      const dateFrom = subDays(new Date(), days).toISOString()

      const data = await fetchEmailEvents({
        eventType,
        dateFrom,
        recipient,
        agent,
      }, 1000)

      setEvents(data)
      setMetrics(computeMetrics(data))
      setChartData(groupEventsByDay(data))
      setLoading(false)
    }
    load()
  }, [daysParam, eventType, agent, recipient])

  if (loading) return <LoadingSpinner />

  // Count by event type for the summary badges
  const eventCounts: Record<string, number> = {}
  for (const e of events) {
    const t = e.event_type || 'unknown'
    eventCounts[t] = (eventCounts[t] || 0) + 1
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Analytics</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {format(new Date(), 'MMMM d, yyyy')} — {events.length.toLocaleString()} events in last {daysParam} days
          </p>
        </div>
      </div>

      {/* Filters */}
      <EmailFilters
        currentEventType={eventType}
        currentAgent={agent}
        currentDays={daysParam}
        currentRecipient={recipient}
      />

      {/* Key Metrics */}
      {metrics && <EmailMetricsCards metrics={metrics} />}

      {/* Event Type Breakdown */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(eventCounts)
          .sort(([, a], [, b]) => b - a)
          .map(([type, count]) => (
            <button
              key={type}
              onClick={() => {
                const params = new URLSearchParams(window.location.search)
                if (params.get('event') === type) {
                  params.delete('event')
                } else {
                  params.set('event', type)
                }
                window.location.search = params.toString()
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                eventType === type
                  ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="capitalize">{type}</span>
              <span className="ml-1.5 opacity-70">{count}</span>
            </button>
          ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6B7280] mb-4">
          Daily Email Activity
        </h2>
        <EmailEventsChart data={chartData} />
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6B7280]">
            Recent Events
          </h2>
          <span className="text-xs text-[#6B7280] bg-[#F5F7FA] px-2 py-1 rounded-full">
            Showing {Math.min(events.length, 100)} of {events.length}
          </span>
        </div>
        <EmailEventsTable events={events} maxItems={100} />
      </div>
    </div>
  )
}

export default function EmailAnalyticsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EmailAnalyticsContent />
    </Suspense>
  )
}
