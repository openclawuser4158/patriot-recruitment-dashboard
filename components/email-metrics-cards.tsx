'use client'

import { MetricCard } from './metric-card'
import { Mail, MousePointerClick, Eye, AlertTriangle, MessageSquare, Send } from 'lucide-react'
import type { EmailSummaryMetrics } from '@/lib/email-events'

interface EmailMetricsCardsProps {
  metrics: EmailSummaryMetrics
}

export function EmailMetricsCards({ metrics }: EmailMetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
      <MetricCard
        title="Total Sent"
        value={metrics.totalSent.toLocaleString()}
        icon={Send}
        accent="navy"
      />
      <MetricCard
        title="Open Rate"
        value={`${metrics.openRate}%`}
        subtitle={`${metrics.uniqueOpens} unique opens`}
        icon={Eye}
        accent="green"
      />
      <MetricCard
        title="Click Rate"
        value={`${metrics.clickRate}%`}
        subtitle={`${metrics.uniqueClicks} unique clicks`}
        icon={MousePointerClick}
        accent="navy"
      />
      <MetricCard
        title="Bounce Rate"
        value={`${metrics.bounceRate}%`}
        subtitle={`${metrics.totalBounces} bounced`}
        icon={AlertTriangle}
        accent={metrics.bounceRate > 5 ? 'red' : 'default'}
      />
      <MetricCard
        title="Reply Rate"
        value={`${metrics.replyRate}%`}
        icon={MessageSquare}
        accent="green"
      />
      <MetricCard
        title="Delivered"
        value={metrics.totalDelivered.toLocaleString()}
        subtitle={`${metrics.totalComplaints} complaints`}
        icon={Mail}
        accent="default"
      />
    </div>
  )
}
