export const dynamic = 'force-dynamic'
import { createServerSupabaseClient } from '@/lib/supabase'
import { statusColor, formatCurrency, daysOpen } from '@/lib/utils'
import { format } from 'date-fns'

interface Submission {
  id: string
  status: string
  submitted_at: string
  notes: string | null
  mandate: { id: string; title: string; location: string; client: { company_name: string } | null } | null
  candidate: { id: string; first_name: string; last_name: string; current_title: string | null } | null
}

async function getPipelineData() {
  const supabase = createServerSupabaseClient()

  const [submissionsRes, pipelineRes] = await Promise.all([
    supabase
      .from('submissions')
      .select(`
        id, status, submitted_at, candidate_summary,
        mandate:mandates(id, role_title, location_city, location_state, client:clients(company_name)),
        candidate:candidates(id, first_name, last_name, current_title)
      `)
      .not('status', 'in', '(rejected,withdrawn)')
      .order('submitted_at', { ascending: false }),
    supabase.from('pipeline_dashboard').select('*').single(),
  ])

  return {
    submissions: (submissionsRes.data ?? []) as unknown as Submission[],
    pipeline: pipelineRes.data,
  }
}

const STAGES = ['submitted', 'reviewing', 'interviewing', 'offered', 'placed']
const STAGE_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  reviewing: 'Under Review',
  interviewing: 'Interviewing',
  offered: 'Offer Out',
  placed: 'Placed',
}

export default async function PipelinePage() {
  const { submissions, pipeline } = await getPipelineData()

  const byStage = STAGES.reduce<Record<string, typeof submissions>>((acc, s) => {
    acc[s] = submissions.filter((sub) => sub.status === s)
    return acc
  }, {})

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          All active candidate submissions by stage
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
        {STAGES.map((stage) => (
          <div key={stage} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{byStage[stage].length}</div>
            <div className="text-xs font-medium text-[#6B7280] mt-1">{STAGE_LABELS[stage]}</div>
          </div>
        ))}
      </div>

      {/* Kanban columns — horizontal scroll on mobile */}
      <div className="-mx-6 px-6 overflow-x-auto sm:mx-0 sm:px-0 sm:overflow-visible">
      <div className="grid grid-cols-5 gap-4 items-start min-w-[900px] sm:min-w-0">
        {STAGES.map((stage) => (
          <div key={stage} className="space-y-3">
            {/* Column header */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                {STAGE_LABELS[stage]}
              </span>
              <span className="text-xs font-bold text-gray-700 bg-gray-100 rounded-full px-2 py-0.5">
                {byStage[stage].length}
              </span>
            </div>

            {/* Cards */}
            {byStage[stage].length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
                No candidates
              </div>
            ) : (
              byStage[stage].map((sub) => {
                const mandate = sub.mandate as any
                const candidate = sub.candidate as any
                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2 hover:border-[#1B2A4A]/30 transition-colors"
                  >
                    <div className="text-sm font-semibold text-gray-900 leading-tight">
                      {candidate?.first_name} {candidate?.last_name}
                    </div>
                    {candidate?.current_title && (
                      <div className="text-xs text-[#6B7280]">{candidate.current_title}</div>
                    )}
                    <div className="pt-1 border-t border-gray-50 space-y-1">
                      <div className="text-xs font-medium text-[#1B2A4A]">
                        {mandate?.role_title ?? mandate?.title}
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        {mandate?.client?.company_name}
                      </div>
                    </div>
                    <div className="text-[10px] text-[#6B7280]">
                      Submitted {format(new Date(sub.submitted_at), 'MMM d')}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  )
}
