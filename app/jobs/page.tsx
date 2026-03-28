'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '../../lib/supabase'

const supabase = createBrowserSupabaseClient()

type Job = {
  id: string
  title: string
  description: string
  job_type: string
  priority: number
  assigned_agent: string
  status: string
  created_by: string
  review_notes: string | null
  started_at: string | null
  completed_at: string | null
  deliverables: string | null
  created_at: string
  updated_at: string
}

const agentMeta: Record<string, { emoji: string; color: string }> = {
  tyler: { emoji: '🏗️', color: 'bg-blue-100 text-blue-800' },
  nate: { emoji: '🌐', color: 'bg-green-100 text-green-800' },
  colton: { emoji: '🔍', color: 'bg-amber-100 text-amber-800' },
  axel: { emoji: '⚡', color: 'bg-purple-100 text-purple-800' },
}

const statusMeta: Record<string, { label: string; color: string; order: number }> = {
  in_progress: { label: 'In Progress', color: 'bg-blue-500', order: 0 },
  queued: { label: 'Queued', color: 'bg-yellow-500', order: 1 },
  pending_review: { label: 'Pending Review', color: 'bg-orange-500', order: 2 },
  blocked: { label: 'Blocked', color: 'bg-red-500', order: 3 },
  done: { label: 'Done', color: 'bg-emerald-500', order: 4 },
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function JobCard({ job }: { job: Job }) {
  const agent = agentMeta[job.assigned_agent] || { emoji: '👤', color: 'bg-gray-100 text-gray-800' }
  const status = statusMeta[job.status] || { label: job.status, color: 'bg-gray-500', order: 99 }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-gray-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${status.color} text-white shadow-sm`}>
              {status.label}
            </span>
            <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">P{job.priority}</span>
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded capitalize">{job.job_type}</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight mb-2">{job.title}</h3>
          {job.description && (
            <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-3">{job.description}</p>
          )}
          {job.deliverables && (
            <p className="text-sm text-emerald-700 mt-2 line-clamp-2 bg-emerald-50 p-2 rounded">✅ {job.deliverables}</p>
          )}
          {job.review_notes && job.status === 'blocked' && (
            <p className="text-sm text-red-700 mt-2 bg-red-50 p-2 rounded">🚫 {job.review_notes}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${agent.color} shadow-sm`}>
            {agent.emoji} {job.assigned_agent}
          </span>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
            {job.started_at ? `Started ${timeAgo(job.started_at)}` : `Created ${timeAgo(job.created_at)}`}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filter, setFilter] = useState<{ agent: string; status: string }>({ agent: 'all', status: 'all' })
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('agent_jobs')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (data) {
      setJobs(data)
      setLastRefresh(new Date())
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 15000) // refresh every 15s
    return () => clearInterval(interval)
  }, [])

  const agents = Array.from(new Set(jobs.map(j => j.assigned_agent))).sort()
  const statuses = ['all', 'in_progress', 'queued', 'pending_review', 'blocked', 'done']

  const filtered = jobs.filter(j => {
    if (filter.agent !== 'all' && j.assigned_agent !== filter.agent) return false
    if (filter.status !== 'all' && j.status !== filter.status) return false
    return true
  })

  const grouped = statuses.slice(1).reduce((acc, s) => {
    acc[s] = filtered.filter(j => j.status === s)
    return acc
  }, {} as Record<string, Job[]>)

  const counts = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'in_progress').length,
    queued: jobs.filter(j => j.status === 'queued').length,
    review: jobs.filter(j => j.status === 'pending_review').length,
    blocked: jobs.filter(j => j.status === 'blocked').length,
    done: jobs.filter(j => j.status === 'done').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading job board...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Agent Job Board</h1>
            <p className="text-sm text-gray-500">
              Patriot Recruitment AI · Real-time agent task monitoring
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Auto-refreshes every 15s · Last: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchJobs}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total', value: counts.total, color: 'text-gray-900', bgColor: 'bg-white' },
            { label: 'Active', value: counts.active, color: 'text-blue-600', bgColor: 'bg-blue-50' },
            { label: 'Queued', value: counts.queued, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
            { label: 'Review', value: counts.review, color: 'text-orange-600', bgColor: 'bg-orange-50' },
            { label: 'Blocked', value: counts.blocked, color: 'text-red-600', bgColor: 'bg-red-50' },
            { label: 'Done', value: counts.done, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bgColor} rounded-xl border border-gray-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow`}>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            value={filter.agent}
            onChange={e => setFilter(f => ({ ...f, agent: e.target.value }))}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
          >
            <option value="all">All Agents</option>
            {agents.map(a => (
              <option key={a} value={a}>{(agentMeta[a]?.emoji || '👤')} {a}</option>
            ))}
          </select>
          <select
            value={filter.status}
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Statuses' : (statusMeta[s]?.label || s)}</option>
            ))}
          </select>
        </div>

        {/* Job Lists by Status */}
        {statuses.slice(1).map(status => {
          const statusJobs = grouped[status]
          if (!statusJobs || statusJobs.length === 0) return null
          const meta = statusMeta[status]
          return (
            <div key={status} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${meta.color} shadow-sm`} />
                <h2 className="text-lg font-bold text-gray-800 tracking-tight">
                  {meta.label} <span className="text-gray-500 font-normal">({statusJobs.length})</span>
                </h2>
              </div>
              <div className="space-y-3">
                {statusJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <div className="text-gray-500 text-lg font-medium">No jobs match your filters</div>
            <div className="text-gray-400 text-sm mt-2">Try adjusting the agent or status filters above</div>
          </div>
        )}
      </div>
    </div>
  )
}
