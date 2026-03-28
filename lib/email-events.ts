import { createBrowserSupabaseClient } from './supabase'

export interface EmailEvent {
  id: string
  mailgun_id: string | null
  event_type: string
  recipient: string
  sender: string | null
  subject: string | null
  agent: string | null
  entity_type: string | null
  entity_id: string | null
  tags: string[] | null
  campaigns: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  timestamp: string
  created_at: string
}

export interface EmailSummaryMetrics {
  totalSent: number
  totalDelivered: number
  totalOpens: number
  totalClicks: number
  totalBounces: number
  totalComplaints: number
  uniqueOpens: number
  uniqueClicks: number
  openRate: number
  clickRate: number
  bounceRate: number
  replyRate: number
}

export interface EmailEventFilters {
  eventType?: string
  dateFrom?: string
  dateTo?: string
  recipient?: string
  agent?: string
}

/**
 * Fetch email events from Supabase email_events table.
 * Falls back to interactions table (channel='email') if email_events is empty.
 */
export async function fetchEmailEvents(
  filters: EmailEventFilters = {},
  limit = 200
): Promise<EmailEvent[]> {
  const supabase = createBrowserSupabaseClient()

  // Try email_events table first
  let query = supabase
    .from('email_events')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (filters.eventType) {
    query = query.eq('event_type', filters.eventType)
  }
  if (filters.dateFrom) {
    query = query.gte('timestamp', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('timestamp', filters.dateTo)
  }
  if (filters.recipient) {
    query = query.ilike('recipient', `%${filters.recipient}%`)
  }
  if (filters.agent) {
    query = query.ilike('agent', `%${filters.agent}%`)
  }

  const { data, error } = await query

  if (!error && data && data.length > 0) {
    return data as EmailEvent[]
  }

  // Fallback: read from interactions table where channel = 'email'
  return fetchFromInteractions(filters, limit)
}

async function fetchFromInteractions(
  filters: EmailEventFilters,
  limit: number
): Promise<EmailEvent[]> {
  const supabase = createBrowserSupabaseClient()

  let query = supabase
    .from('interactions')
    .select('*')
    .eq('channel', 'email')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }
  if (filters.agent) {
    query = query.ilike('agent', `%${filters.agent}%`)
  }

  const { data, error } = await query

  if (error || !data) return []

  // Map interactions to EmailEvent shape
  return data.map((row: Record<string, unknown>) => {
    const meta = (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) || {}
    const eventType = meta.event_type || meta.mailgun_event_type || 'delivered'
    const recipient = meta.contact_email || meta.recipient || ''
    const sender = meta.sender || ''

    // Apply event type filter after mapping
    if (filters.eventType && eventType !== filters.eventType) {
      return null
    }
    // Apply recipient filter after mapping
    if (filters.recipient && !recipient.toLowerCase().includes(filters.recipient.toLowerCase())) {
      return null
    }

    return {
      id: row.id as string,
      mailgun_id: (meta.mailgun_id as string) || null,
      event_type: eventType,
      recipient,
      sender,
      subject: (row.subject as string) || (meta.subject as string) || null,
      agent: (row.agent as string) || null,
      entity_type: (row.entity_type as string) || null,
      entity_id: (row.entity_id as string) || null,
      tags: (meta.tags as string[]) || null,
      campaigns: (meta.campaigns as Record<string, unknown>) || null,
      metadata: meta,
      timestamp: (row.created_at as string) || new Date().toISOString(),
      created_at: (row.created_at as string) || new Date().toISOString(),
    } as EmailEvent
  }).filter(Boolean) as EmailEvent[]
}

/**
 * Compute summary metrics from email events
 */
export function computeMetrics(events: EmailEvent[]): EmailSummaryMetrics {
  const counts: Record<string, number> = {}
  const uniqueOpenRecipients = new Set<string>()
  const uniqueClickRecipients = new Set<string>()
  const replyRecipients = new Set<string>()

  for (const e of events) {
    const t = e.event_type || 'unknown'
    counts[t] = (counts[t] || 0) + 1

    if (t === 'opened' && e.recipient) uniqueOpenRecipients.add(e.recipient)
    if (t === 'clicked' && e.recipient) uniqueClickRecipients.add(e.recipient)
    if ((t === 'replied' || t === 'stored') && e.recipient) replyRecipients.add(e.recipient)
  }

  const totalSent = (counts['accepted'] || 0) + (counts['delivered'] || 0) + (counts['stored'] || 0)
  const totalDelivered = counts['delivered'] || 0
  const totalOpens = counts['opened'] || 0
  const totalClicks = counts['clicked'] || 0
  const totalBounces = (counts['bounced'] || 0) + (counts['failed'] || 0)
  const totalComplaints = counts['complained'] || 0
  const denominator = totalDelivered || totalSent || 1

  return {
    totalSent: totalSent || events.length, // fallback: count all events as sends if no event_type data
    totalDelivered,
    totalOpens,
    totalClicks,
    totalBounces,
    totalComplaints,
    uniqueOpens: uniqueOpenRecipients.size,
    uniqueClicks: uniqueClickRecipients.size,
    openRate: parseFloat(((uniqueOpenRecipients.size / denominator) * 100).toFixed(1)),
    clickRate: parseFloat(((uniqueClickRecipients.size / denominator) * 100).toFixed(1)),
    bounceRate: parseFloat(((totalBounces / (totalSent || 1)) * 100).toFixed(1)),
    replyRate: parseFloat(((replyRecipients.size / denominator) * 100).toFixed(1)),
  }
}

/**
 * Group events by day for chart data
 */
export function groupEventsByDay(events: EmailEvent[]): { date: string; sent: number; opened: number; clicked: number; bounced: number }[] {
  const days: Record<string, { sent: number; opened: number; clicked: number; bounced: number }> = {}

  for (const e of events) {
    const day = e.timestamp.split('T')[0]
    if (!days[day]) days[day] = { sent: 0, opened: 0, clicked: 0, bounced: 0 }
    const t = e.event_type
    if (t === 'accepted' || t === 'delivered') days[day].sent++
    else if (t === 'opened') days[day].opened++
    else if (t === 'clicked') days[day].clicked++
    else if (t === 'bounced' || t === 'failed') days[day].bounced++
    else days[day].sent++ // default to sent
  }

  return Object.entries(days)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }))
}
