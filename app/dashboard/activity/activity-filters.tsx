'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface ActivityFiltersProps {
  agents: string[]
  entityTypes: string[]
  currentAgent?: string
  currentEntity?: string
}

export function ActivityFilters({ agents, entityTypes, currentAgent, currentEntity }: ActivityFiltersProps) {
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
      router.push(`/dashboard/activity?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex items-center gap-3">
      <select
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
        value={currentAgent ?? ''}
        onChange={(e) => updateFilter('agent', e.target.value)}
      >
        <option value="">All Agents</option>
        {agents.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      <select
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
        value={currentEntity ?? ''}
        onChange={(e) => updateFilter('entity', e.target.value)}
      >
        <option value="">All Types</option>
        {entityTypes.map((e) => (
          <option key={e} value={e} className="capitalize">{e}</option>
        ))}
      </select>

      {(currentAgent || currentEntity) && (
        <button
          onClick={() => {
            router.push('/dashboard/activity')
          }}
          className="text-xs text-[#C41E3A] hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  )
}
