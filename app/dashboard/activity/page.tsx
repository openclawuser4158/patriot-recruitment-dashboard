'use client'

import { Suspense, useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { ActivityFeed } from '@/components/activity-feed'
import { subDays } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import { ActivityFilters } from './activity-filters'

const AGENTS = ['Tyler', 'Madison', 'Colton', 'Harper', 'Brooke', 'Nate']
const ENTITY_TYPES = ['client', 'mandate', 'candidate', 'submission', 'placement', 'invoice']

interface Interaction {
  id: string
  agent: string
  entity_type: string
  entity_id: string
  channel: string | null
  direction: string | null
  subject: string | null
  content: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

function LoadingSpinner() {
  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#6B7280]">Loading activity…</p>
      </div>
    </div>
  )
}

function ActivityContent() {
  const searchParams = useSearchParams()
  const agentFilter = searchParams.get('agent') ?? undefined
  const entityFilter = searchParams.get('entity') ?? undefined

  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const supabase = createBrowserSupabaseClient()

      let query = supabase
        .from('interactions')
        .select('*')
        .gte('created_at', subDays(new Date(), 7).toISOString())
        .order('created_at', { ascending: false })
        .limit(100)

      if (agentFilter) query = query.ilike('agent', `%${agentFilter}%`)
      if (entityFilter) query = query.eq('entity_type', entityFilter)

      const { data } = await query
      setInteractions((data ?? []) as Interaction[])
      setLoading(false)
    }
    fetchData()
  }, [agentFilter, entityFilter])

  if (loading) {
    return <LoadingSpinner />
  }

  const agentCounts = AGENTS.reduce<Record<string, number>>((acc, agent) => {
    acc[agent] = interactions.filter((i) =>
      i.agent.toLowerCase().includes(agent.toLowerCase())
    ).length
    return acc
  }, {})

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
        <p className="text-sm text-[#6B7280] mt-1">Last 7 days — {interactions.length} interactions</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 sm:gap-3">
        {AGENTS.map((agent) => (
          <div key={agent} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="text-xl font-bold text-gray-900">{agentCounts[agent]}</div>
            <div className="text-xs font-medium text-[#6B7280] mt-1">{agent}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6B7280]">
            Interactions
          </h2>
          <ActivityFilters
            agents={AGENTS}
            entityTypes={ENTITY_TYPES}
            currentAgent={agentFilter}
            currentEntity={entityFilter}
          />
        </div>
        <ActivityFeed interactions={interactions} maxItems={100} />
      </div>
    </div>
  )
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ActivityContent />
    </Suspense>
  )
}
