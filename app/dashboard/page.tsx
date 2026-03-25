import { createServerSupabaseClient } from '@/lib/supabase'
import { MetricCard } from '@/components/metric-card'
import { PipelineFunnel } from '@/components/pipeline-funnel'
import { ActivityFeed } from '@/components/activity-feed'
import { RevenueChart } from '@/components/revenue-chart'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, Briefcase, Users, TrendingUp } from 'lucide-react'
import { format, subDays, startOfMonth, subMonths } from 'date-fns'

interface PipelineData {
  leads: number | null
  tob_pending: number | null
  active_clients: number | null
  active_mandates: number | null
  candidates_submitted: number | null
  interviewing: number | null
  offers_out: number | null
  active_placements: number | null
  total_revenue: number | null
  invoiced: number | null
  collected: number | null
}

interface ActivityRow {
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

async function getDashboardData() {
  const supabase = createServerSupabaseClient()

  const [pipelineRes, recentActivityRes, mandatesCountRes, placementsMonthRes, monthlyRevenueRes] =
    await Promise.all([
      supabase.from('pipeline_dashboard').select('*').single(),
      supabase
        .from('interactions')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('mandates')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('placements')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth(new Date()).toISOString()),
      // Monthly revenue for last 6 months
      supabase
        .from('invoices')
        .select('amount, status, sent_date, paid_date')
        .gte('sent_date', subMonths(new Date(), 6).toISOString()),
    ])

  // Build monthly revenue buckets
  const monthlyData: Record<string, { invoiced: number; revenue: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i)
    const key = format(d, 'MMM yy')
    monthlyData[key] = { invoiced: 0, revenue: 0 }
  }

  for (const inv of (monthlyRevenueRes.data ?? []) as { amount: number; status: string; sent_date: string | null; paid_date: string | null }[]) {
    if (!inv.sent_date) continue
    const key = format(new Date(inv.sent_date), 'MMM yy')
    if (monthlyData[key]) {
      monthlyData[key].invoiced += inv.amount
      if (inv.status === 'paid') monthlyData[key].revenue += inv.amount
    }
  }

  const chartData = Object.entries(monthlyData).map(([month, vals]) => ({
    month,
    ...vals,
  }))

  return {
    pipeline: pipelineRes.data as PipelineData | null,
    recentActivity: (recentActivityRes.data ?? []) as ActivityRow[],
    activeMandates: mandatesCountRes.count ?? 0,
    placementsThisMonth: placementsMonthRes.count ?? 0,
    chartData,
  }
}

export default async function DashboardPage() {
  const { pipeline, recentActivity, activeMandates, placementsThisMonth, chartData } =
    await getDashboardData()

  const funnelStages = [
    { key: 'leads', label: 'Leads', count: pipeline?.leads ?? 0 },
    { key: 'tob_pending', label: 'Qualifying', count: pipeline?.tob_pending ?? 0 },
    { key: 'active_clients', label: 'ToB Signed', count: pipeline?.active_clients ?? 0 },
    { key: 'active_mandates', label: 'Mandates', count: pipeline?.active_mandates ?? 0 },
    { key: 'candidates_submitted', label: 'Submitted', count: pipeline?.candidates_submitted ?? 0 },
    { key: 'interviewing', label: 'Interviewing', count: pipeline?.interviewing ?? 0 },
    { key: 'offers_out', label: 'Offers', count: pipeline?.offers_out ?? 0, value: null },
    { key: 'active_placements', label: 'Placed', count: pipeline?.active_placements ?? 0, value: pipeline?.total_revenue },
    { key: 'invoiced', label: 'Invoiced', count: null, value: pipeline?.invoiced },
    { key: 'collected', label: 'Collected', count: null, value: pipeline?.collected },
  ].map((s) => ({ ...s, count: s.count ?? 0 }))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")} — Live recruitment pipeline overview
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(pipeline?.total_revenue)}
          subtitle="Collected to date"
          icon={DollarSign}
          accent="red"
        />
        <MetricCard
          title="Active Mandates"
          value={activeMandates}
          subtitle="Open positions"
          icon={Briefcase}
          accent="navy"
        />
        <MetricCard
          title="Candidates in Pipeline"
          value={pipeline?.candidates_submitted ?? 0}
          subtitle="Submitted + interviewing"
          icon={Users}
          accent="default"
        />
        <MetricCard
          title="Placements This Month"
          value={placementsThisMonth}
          subtitle={`${pipeline?.active_placements ?? 0} active overall`}
          icon={TrendingUp}
          accent="green"
        />
      </div>

      {/* Pipeline Funnel */}
      <PipelineFunnel stages={funnelStages} />

      {/* Revenue Chart + Activity Feed */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6B7280]">
              Monthly Revenue (6 months)
            </h2>
            <div className="flex items-center gap-4 text-xs text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#1B2A4A]" />
                Invoiced
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#C41E3A]" />
                Collected
              </span>
            </div>
          </div>
          <RevenueChart data={chartData} />
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6B7280]">
              Recent Activity
            </h2>
            <span className="text-xs text-[#6B7280] bg-[#F5F7FA] px-2 py-1 rounded-full">
              Last 24h
            </span>
          </div>
          <ActivityFeed interactions={recentActivity} maxItems={8} />
        </div>
      </div>
    </div>
  )
}
