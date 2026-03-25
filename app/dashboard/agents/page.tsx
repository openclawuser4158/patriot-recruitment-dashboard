export const dynamic = 'force-dynamic'
import { createServerSupabaseClient } from '@/lib/supabase'
import { MetricCard } from '@/components/metric-card'
import { formatRelativeTime } from '@/lib/utils'
import { Users, Briefcase, FileText, TrendingUp } from 'lucide-react'

const AGENTS = [
  {
    name: 'Tyler Reed',
    role: 'Business Development',
    emoji: '🎯',
    color: 'bg-blue-500',
    responsibilities: 'Lead generation, outreach, cold/warm intros, market intel',
  },
  {
    name: 'Madison Cole',
    role: 'Client Relations',
    emoji: '🤝',
    color: 'bg-purple-500',
    responsibilities: 'Client onboarding, ToB management, mandate intake, client comms',
  },
  {
    name: 'Colton Brooks',
    role: 'Senior Recruiter',
    emoji: '🔍',
    color: 'bg-emerald-500',
    responsibilities: 'Candidate sourcing, screening, database management',
  },
  {
    name: 'Harper Quinn',
    role: 'Placement Coordinator',
    emoji: '📋',
    color: 'bg-amber-500',
    responsibilities: 'Submissions, interview coordination, offer management',
  },
  {
    name: 'Brooke Lawson',
    role: 'Post-Placement Success',
    emoji: '⭐',
    color: 'bg-rose-500',
    responsibilities: 'Check-ins, guarantees, testimonials, invoicing',
  },
  {
    name: 'Nate Lawson',
    role: 'Web & Platform',
    emoji: '🌐',
    color: 'bg-teal-500',
    responsibilities: 'Website, SEO, schema, API endpoints, analytics',
  },
]

async function getAgentStats() {
  const supabase = createServerSupabaseClient()

  const { data: interactions } = await supabase
    .from('interactions')
    .select('agent, created_at')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })

  const rows = (interactions ?? []) as { agent: string; created_at: string }[]

  // Count interactions per agent (last 7d)
  const agentActivity: Record<string, { count: number; lastActive: string | null }> = {}
  for (const agent of AGENTS) {
    const matching = rows.filter((i) =>
      i.agent.toLowerCase().includes(agent.name.split(' ')[0].toLowerCase())
    )
    agentActivity[agent.name] = {
      count: matching.length,
      lastActive: matching.length > 0 ? matching[0].created_at : null,
    }
  }

  // Pipeline stats per agent (via handoffs)
  const { data: handoffs } = await supabase
    .from('handoffs')
    .select('from_agent, to_agent, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const handoffRows = (handoffs ?? []) as {
    from_agent: string
    to_agent: string
    status: string
    created_at: string
  }[]

  return { agentActivity, handoffs: handoffRows }
}

export default async function AgentsPage() {
  const { agentActivity, handoffs } = await getAgentStats()

  const totalInteractions = Object.values(agentActivity).reduce((s, a) => s + a.count, 0)
  const activeAgents = Object.values(agentActivity).filter((a) => a.count > 0).length
  const pendingHandoffs = handoffs.filter((h) => h.status === 'pending').length

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          AI agent activity and performance — last 7 days
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 sm:gap-4">
        <MetricCard
          title="Active Agents"
          value={`${activeAgents} / ${AGENTS.length}`}
          subtitle="With activity this week"
          icon={Users}
          accent="navy"
        />
        <MetricCard
          title="Total Interactions"
          value={totalInteractions}
          subtitle="Last 7 days"
          icon={FileText}
          accent="default"
        />
        <MetricCard
          title="Pending Handoffs"
          value={pendingHandoffs}
          subtitle="Awaiting acceptance"
          icon={Briefcase}
          accent={pendingHandoffs > 5 ? 'red' : 'green'}
        />
        <MetricCard
          title="Avg per Agent"
          value={AGENTS.length > 0 ? Math.round(totalInteractions / AGENTS.length) : 0}
          subtitle="Interactions / week"
          icon={TrendingUp}
          accent="default"
        />
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {AGENTS.map((agent) => {
          const stats = agentActivity[agent.name] ?? { count: 0, lastActive: null }
          return (
            <div
              key={agent.name}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex gap-4"
            >
              {/* Avatar */}
              <div
                className={`w-12 h-12 rounded-xl ${agent.color} flex items-center justify-center text-white text-xl flex-shrink-0`}
              >
                {agent.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{agent.name}</div>
                    <div className="text-xs font-medium text-[#6B7280]">{agent.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{stats.count}</div>
                    <div className="text-[10px] text-[#6B7280]">interactions</div>
                  </div>
                </div>

                <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
                  {agent.responsibilities}
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        stats.count > 0 ? 'bg-emerald-400' : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-xs text-[#6B7280]">
                      {stats.count > 0 ? 'Active this week' : 'No activity'}
                    </span>
                  </div>
                  {stats.lastActive && (
                    <span className="text-xs text-[#6B7280]">
                      Last: {formatRelativeTime(stats.lastActive)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent handoffs */}
      {handoffs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6B7280] mb-4">
            Recent Handoffs
          </h2>
          <div className="space-y-3">
            {handoffs.slice(0, 10).map((h) => (
              <div
                key={h.created_at + h.from_agent}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-900">{h.from_agent}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium text-gray-900">{h.to_agent}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      h.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : h.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {h.status}
                  </span>
                  <span className="text-xs text-[#6B7280]">
                    {formatRelativeTime(h.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
