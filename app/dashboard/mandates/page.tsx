'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { statusColor, formatCurrency, daysOpen } from '@/lib/utils'
import { MandateRow as MandateRowComponent, MandateCard } from './mandate-row'

interface MandateData {
  id: string
  role_title: string
  location_city: string | null
  location_state: string | null
  status: string
  urgency: string | null
  salary_min: number | null
  salary_max: number | null
  created_at: string
  updated_at: string
  responsibilities: string | null
  fee_percentage: number | null
  client: { id: string; company_name: string; status: string } | null
  submissions: { id: string; status: string }[]
}

export default function MandatesPage() {
  const [mandates, setMandates] = useState<MandateData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createBrowserSupabaseClient()

      const { data } = await supabase
        .from('mandates')
        .select(`
          id, role_title, location_city, location_state, status, urgency, salary_min, salary_max,
          created_at, updated_at, responsibilities, fee_percentage,
          client:clients(id, company_name, status),
          submissions(id, status)
        `)
        .in('status', ['active', 'on_hold'])
        .order('created_at', { ascending: false })

      setMandates((data ?? []) as unknown as MandateData[])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading mandates…</p>
        </div>
      </div>
    )
  }

  const active = mandates.filter((m) => m.status === 'active')
  const onHold = mandates.filter((m) => m.status === 'on_hold')

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mandates</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {active.length} active · {onHold.length} on hold
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 sm:gap-4">
        <div className="bg-white rounded-xl border border-t-4 border-t-[#1B2A4A] border-gray-100 shadow-sm p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Active</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{active.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-t-4 border-t-amber-400 border-gray-100 shadow-sm p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">On Hold</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{onHold.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-t-4 border-t-[#C41E3A] border-gray-100 shadow-sm p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Urgent</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {mandates.filter((m) => m.urgency === 'high' || m.urgency === 'urgent').length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-t-4 border-t-emerald-500 border-gray-100 shadow-sm p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Avg Days Open</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {mandates.length > 0
              ? Math.round(mandates.reduce((sum, m) => sum + daysOpen(m.created_at), 0) / mandates.length)
              : 0}
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {mandates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-[#6B7280] text-sm">
            No active mandates
          </div>
        ) : (
          mandates.map((mandate) => (
            <MandateCard key={mandate.id} mandate={mandate} />
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-[#F5F7FA]">
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] px-5 py-3">
                Company / Role
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] px-4 py-3">
                Location
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] px-4 py-3">
                Urgency
              </th>
              <th className="text-right text-xs font-semibold uppercase tracking-wider text-[#6B7280] px-4 py-3">
                Days Open
              </th>
              <th className="text-right text-xs font-semibold uppercase tracking-wider text-[#6B7280] px-4 py-3">
                Candidates
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] px-4 py-3">
                Salary Range
              </th>
            </tr>
          </thead>
          <tbody>
            {mandates.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#6B7280] text-sm">
                  No active mandates
                </td>
              </tr>
            ) : (
              mandates.map((mandate) => (
                <MandateRowComponent key={mandate.id} mandate={mandate} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
