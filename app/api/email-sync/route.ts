import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/email-sync
 * 
 * Pulls events from Mailgun Events API and stores them in the email_events table.
 * Supports incremental sync via sync_metadata table.
 * 
 * Protected by CRON_SECRET header to prevent unauthorized triggers.
 */

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'patriotrecruitment.ai'
const MAILGUN_BASE = 'https://api.eu.mailgun.net/v3'
const CRON_SECRET = process.env.CRON_SECRET

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function POST(request: Request) {
  // Auth check
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!MAILGUN_API_KEY) {
    return NextResponse.json({ error: 'MAILGUN_API_KEY not configured' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    // Get last sync timestamp
    const { data: syncMeta } = await supabase
      .from('sync_metadata')
      .select('value')
      .eq('key', 'mailgun_events_last_sync')
      .limit(1)

    const lastSync = syncMeta?.[0]?.value
    // Mailgun accepts Unix timestamps for begin param
    const beginUnix = lastSync
      ? Math.floor(new Date(lastSync).getTime() / 1000)
      : Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000)

    // Fetch from Mailgun
    const auth = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')
    const params = new URLSearchParams({
      limit: '300',
      begin: String(beginUnix),
      ascending: 'yes',
    })

    let totalStored = 0
    const initialUrl = `${MAILGUN_BASE}/${MAILGUN_DOMAIN}/events?${params}`
    let fetchUrl: string = initialUrl
    let pages = 0
    let latestTimestamp: string | null = null
    let hasMore = true

    while (hasMore && pages < 20) {
      pages++

      const res: Response = await fetch(fetchUrl, {
        headers: { Authorization: `Basic ${auth}` },
      })

      if (!res.ok) {
        return NextResponse.json(
          { error: `Mailgun API error: ${res.status} ${res.statusText}` },
          { status: 502 }
        )
      }

      const body = await res.json()
      const items = body.items || []

      if (items.length === 0) break

      // Transform and upsert events
      const events = items
        .filter((e: Record<string, unknown>) => e.id && e.timestamp != null)
        .map((e: Record<string, unknown>) => {
          const headers = (e.message as Record<string, unknown>)?.headers as Record<string, string> | undefined
          const recipient = (e.recipient as string) || headers?.to || ''
          const sender = headers?.from || ''
          const ts = new Date((e.timestamp as number) * 1000).toISOString()

          if (!latestTimestamp || ts > latestTimestamp) latestTimestamp = ts

          // Determine agent from sender
          let agent = 'system'
          if (sender.includes('tyler@')) agent = 'tyler'
          else if (sender.includes('madison@')) agent = 'madison'
          else if (sender.includes('colton@')) agent = 'colton'
          else if (sender.includes('harper@')) agent = 'harper'
          else if (sender.includes('brooke@')) agent = 'brooke'
          else if (sender.includes('sam@')) agent = 'sam'
          else if (sender.includes('nate@')) agent = 'nate'

          return {
            mailgun_id: e.id as string,
            event_type: e.event as string,
            recipient: recipient.replace(/^.*<(.+)>.*$/, '$1').trim(),
            sender: sender.replace(/^.*<(.+)>.*$/, '$1').trim(),
            subject: headers?.subject || '',
            agent,
            tags: (e.tags as string[]) || [],
            campaigns: e.campaigns || null,
            metadata: {
              ip: e.ip,
              geolocation: e.geolocation,
              'client-info': e['client-info'],
              'user-variables': e['user-variables'],
              url: e.url, // for click events
              'delivery-status': e['delivery-status'],
            },
            timestamp: ts,
          }
        })

      if (events.length > 0) {
        // Upsert to handle duplicates gracefully
        const { error: insertError } = await supabase
          .from('email_events')
          .upsert(events, { onConflict: 'mailgun_id', ignoreDuplicates: true })

        if (insertError) {
          console.error('Insert error:', insertError)
        } else {
          totalStored += events.length
        }
      }

      // Get next page
      const nextPage: string | undefined = body.paging?.next
      if (nextPage) {
        const parsed = new URL(nextPage)
        if (parsed.hostname === 'api.eu.mailgun.net') {
          fetchUrl = nextPage
        } else {
          hasMore = false // Security: don't follow unexpected hosts
        }
      } else {
        hasMore = false
      }
    }

    // Save sync bookmark
    if (latestTimestamp) {
      await supabase
        .from('sync_metadata')
        .upsert(
          { key: 'mailgun_events_last_sync', value: latestTimestamp, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
    }

    return NextResponse.json({
      success: true,
      stored: totalStored,
      pages,
      lastSync: latestTimestamp || String(beginUnix),
    })
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json(
      { error: 'Sync failed', details: (err as Error).message },
      { status: 500 }
    )
  }
}

// GET for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'email-sync',
    description: 'POST to trigger Mailgun → Supabase email events sync',
  })
}
