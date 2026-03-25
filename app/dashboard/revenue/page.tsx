import { createServerSupabaseClient } from '@/lib/supabase'
import { MetricCard } from '@/components/metric-card'
import { RevenueChart } from '@/components/revenue-chart'
import { statusColor, formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, TrendingUp, Clock } from 'lucide-react'
import { format, subMonths, startOfMonth } from 'date-fns'
import { cn } from '@/lib/utils'

interface Invoice {
  id: string
  amount: number
  status: string
  sent_date: string | null
  due_date: string
  paid_date: string | null
  placement: any
}

interface MonthlyInvoice {
  amount: number
  status: string
  sent_date: string | null
  paid_date: string | null
}

async function getRevenueData() {
  const supabase = createServerSupabaseClient()

  const [invoicesRes, pipelineRes, monthlyRes] = await Promise.all([
    supabase
      .from('invoices')
      .select(`
        id, amount, status, sent_date, due_date, paid_date,
        placement:placements(
          id,
          candidate:candidates(first_name, last_name),
          mandate:mandates(role_title, client:clients(company_name))
        )
      `)
      .order('sent_date', { ascending: false })
      .limit(50),
    supabase.from('pipeline_dashboard').select('*').single(),
    supabase
      .from('invoices')
      .select('amount, status, sent_date, paid_date')
      .gte('sent_date', subMonths(new Date(), 6).toISOString()),
  ])

  // Build monthly chart data
  const monthlyData: Record<string, { invoiced: number; revenue: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i)
    const key = format(d, 'MMM yy')
    monthlyData[key] = { invoiced: 0, revenue: 0 }
  }
  for (const inv of (monthlyRes.data ?? []) as MonthlyInvoice[]) {
    if (!inv.sent_date) continue
    const key = format(new Date(inv.sent_date), 'MMM yy')
    if (monthlyData[key]) {
      monthlyData[key].invoiced += inv.amount
      if (inv.status === 'paid') monthlyData[key].revenue += inv.amount
    }
  }

  const invoices = (invoicesRes.data ?? []) as unknown as Invoice[]
  const total = invoices.reduce((s, i) => s + i.amount, 0)
  const collected = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const outstanding = invoices
    .filter((i) => !['paid', 'written_off'].includes(i.status))
    .reduce((s, i) => s + i.amount, 0)

  return {
    invoices,
    total,
    collected,
    outstanding,
    pipeline: pipelineRes.data,
    chartData: Object.entries(monthlyData).map(([month, vals]) => ({ month, ...vals })),
  }
}

export default async function RevenuePage() {
  const { invoices, total, collected, outstanding, pipeline, chartData } = await getRevenueData()

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
        <p className="text-sm text-[#6B7280] mt-1">Invoice tracker and revenue analytics</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <MetricCard
          title="Total Billed"
          value={formatCurrency(total)}
          subtitle="All invoices"
          icon={DollarSign}
          accent="navy"
        />
        <MetricCard
          title="Collected"
          value={formatCurrency(collected)}
          subtitle={`${total > 0 ? Math.round((collected / total) * 100) : 0}% collection rate`}
          icon={TrendingUp}
          accent="green"
        />
        <MetricCard
          title="Outstanding"
          value={formatCurrency(outstanding)}
          subtitle="Pending + overdue"
          icon={Clock}
          accent="red"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6B7280]">
            Monthly Revenue (6 months)
          </h2>
          <div className="flex items-center gap-4 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#1B2A4A]" /> Invoiced
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#C41E3A]" /> Collected
            </span>
          </div>
        </div>
        <RevenueChart data={chartData} />
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6B7280]">Invoices</h2>
          <span className="text-xs text-[#6B7280]">{invoices.length} total</span>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 bg-[#F5F7FA]">
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] px-5 py-3">Client / Role</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] px-4 py-3">Amount</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] px-4 py-3">Issued</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] px-4 py-3">Due</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] px-4 py-3">Paid</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[#6B7280] text-sm">No invoices found</td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const placement = inv.placement as any
                const candidate = placement?.candidate
                const mandate = placement?.mandate

                return (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-[#F5F7FA] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-medium text-gray-900">
                        {mandate?.client?.company_name ?? '—'}
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        {candidate ? `${candidate.first_name} ${candidate.last_name}` : '—'}
                        {mandate?.role_title ? ` · ${mandate.role_title}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">
                        {formatCurrency(inv.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusColor(inv.status))}>
                        {inv.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(inv.sent_date)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(inv.due_date)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(inv.paid_date)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
