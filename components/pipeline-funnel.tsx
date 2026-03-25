'use client'

import { cn } from '@/lib/utils'

interface FunnelStage {
  label: string
  key: string
  count: number | null
  value?: number | null
  color?: string
}

interface PipelineFunnelProps {
  stages: FunnelStage[]
}

export function PipelineFunnel({ stages }: PipelineFunnelProps) {
  const max = Math.max(...stages.map((s) => s.count ?? 0), 1)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6B7280] mb-6">
        Recruitment Pipeline
      </h2>
      <div className="flex items-end gap-0">
        {stages.map((stage, i) => {
          const count = stage.count ?? 0
          const pct = Math.max((count / max) * 100, 8) // min 8% for visibility
          const isLast = i === stages.length - 1

          return (
            <div key={stage.key} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar */}
              <div className="w-full px-1">
                <div
                  className={cn(
                    'w-full rounded-t transition-all duration-300',
                    i === 0
                      ? 'bg-[#1B2A4A]'
                      : i < 3
                      ? 'bg-[#2d4a7a]'
                      : i < 6
                      ? 'bg-[#1B2A4A]/70'
                      : 'bg-[#C41E3A]'
                  )}
                  style={{ height: `${(pct / 100) * 120}px` }}
                />
              </div>

              {/* Connector arrow */}
              {!isLast && (
                <div className="absolute" style={{ display: 'none' }} />
              )}

              {/* Count */}
              <div className="text-lg font-bold text-gray-900">{count}</div>

              {/* Label */}
              <div className="text-[10px] font-medium text-[#6B7280] text-center leading-tight px-1">
                {stage.label}
              </div>

              {/* Value (if applicable) */}
              {stage.value != null && stage.value > 0 && (
                <div className="text-[10px] font-semibold text-[#C41E3A]">
                  ${(stage.value / 1000).toFixed(0)}k
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Flow arrows row */}
      <div className="flex items-center mt-3 px-2">
        {stages.map((_, i) => (
          <div key={i} className="flex-1 flex items-center">
            {i < stages.length - 1 && (
              <div className="flex-1 flex items-center justify-end pr-1">
                <svg width="20" height="10" viewBox="0 0 20 10" className="text-gray-300">
                  <path d="M0 5 L14 5 M10 1 L18 5 L10 9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
