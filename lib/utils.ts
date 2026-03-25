import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  return `${diffDays}d ago`
}

export function daysOpen(dateStr: string): number {
  const created = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    // client_status
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    responding: 'bg-yellow-100 text-yellow-800',
    qualifying: 'bg-orange-100 text-orange-800',
    tob_sent: 'bg-purple-100 text-purple-800',
    tob_signed: 'bg-purple-100 text-purple-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-600',
    // mandate_status
    draft: 'bg-gray-100 text-gray-600',
    on_hold: 'bg-yellow-100 text-yellow-800',
    filled: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-700',
    // submission_status
    submitted: 'bg-blue-100 text-blue-800',
    reviewing: 'bg-yellow-100 text-yellow-800',
    interviewing: 'bg-purple-100 text-purple-800',
    offered: 'bg-orange-100 text-orange-800',
    placed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-700',
    withdrawn: 'bg-gray-100 text-gray-600',
    // offer_status
    pending: 'bg-yellow-100 text-yellow-800',
    extended: 'bg-orange-100 text-orange-800',
    accepted: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-700',
    countered: 'bg-purple-100 text-purple-800',
    // placement_status
    confirmed: 'bg-blue-100 text-blue-800',
    started: 'bg-green-100 text-green-800',
    guarantee_period: 'bg-teal-100 text-teal-800',
    completed: 'bg-green-100 text-green-800',
    terminated: 'bg-red-100 text-red-700',
    // invoice_status
    sent: 'bg-blue-100 text-blue-800',
    overdue_7: 'bg-orange-100 text-orange-800',
    overdue_14: 'bg-orange-200 text-orange-900',
    overdue_30: 'bg-red-100 text-red-700',
    paid: 'bg-green-100 text-green-800',
    disputed: 'bg-red-200 text-red-900',
    written_off: 'bg-gray-200 text-gray-600',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}
