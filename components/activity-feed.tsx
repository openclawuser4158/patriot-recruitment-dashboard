'use client'

import { formatRelativeTime } from '@/lib/utils'
import { MessageSquare, Phone, Mail, Globe, Users, Briefcase, FileText, DollarSign } from 'lucide-react'

interface Interaction {
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

interface ActivityFeedProps {
  interactions: Interaction[]
  maxItems?: number
}

const channelIcon = (channel: string | null) => {
  switch (channel?.toLowerCase()) {
    case 'call': return <Phone size={14} />
    case 'email': return <Mail size={14} />
    case 'web': return <Globe size={14} />
    case 'sms': return <MessageSquare size={14} />
    default: return <MessageSquare size={14} />
  }
}

const entityIcon = (entityType: string) => {
  switch (entityType?.toLowerCase()) {
    case 'client': return <Users size={14} className="text-blue-500" />
    case 'mandate': return <Briefcase size={14} className="text-purple-500" />
    case 'candidate': return <Users size={14} className="text-green-500" />
    case 'invoice': return <DollarSign size={14} className="text-amber-500" />
    case 'placement': return <FileText size={14} className="text-teal-500" />
    default: return <FileText size={14} className="text-gray-400" />
  }
}

const agentInitials = (name: string) => {
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : name.substring(0, 2)
}

const agentColor = (name: string): string => {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-teal-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function ActivityFeed({ interactions, maxItems = 20 }: ActivityFeedProps) {
  const items = interactions.slice(0, maxItems)

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-[#6B7280] text-sm">
        No recent activity
      </div>
    )
  }

  return (
    <div className="space-y-0 divide-y divide-gray-50">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 py-3 px-1 hover:bg-gray-50/70 rounded-lg transition-colors">
          {/* Agent avatar */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${agentColor(item.agent)}`}
          >
            {agentInitials(item.agent)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900">{item.agent}</span>
              <span className="text-sm text-gray-600 truncate">{item.subject || item.content || 'Interaction'}</span>
              <div className="flex items-center gap-1 text-[#6B7280]">
                {entityIcon(item.entity_type)}
                <span className="text-xs capitalize">{item.entity_type}</span>
              </div>
            </div>
            {item.content && item.subject && (
              <div className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">{item.content}</div>
            )}
          </div>

          {/* Right side */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-xs text-[#6B7280]">{formatRelativeTime(item.created_at)}</span>
            {item.channel && (
              <div className="flex items-center gap-1 text-[#6B7280] text-xs">
                {channelIcon(item.channel)}
                <span>{item.channel}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
