import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          company_name: string
          industry: string | null
          website: string | null
          status: string
          created_at: string
          updated_at: string
        }
      }
      client_contacts: {
        Row: {
          id: string
          client_id: string
          first_name: string
          last_name: string
          title: string | null
          email: string | null
          phone: string | null
          is_primary: boolean
        }
      }
      mandates: {
        Row: {
          id: string
          client_id: string
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
        }
      }
      candidates: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          current_title: string | null
          location: string | null
          status: string
          created_at: string
        }
      }
      submissions: {
        Row: {
          id: string
          mandate_id: string
          candidate_id: string
          status: string
          submitted_at: string
          notes: string | null
        }
      }
      interviews: {
        Row: {
          id: string
          submission_id: string
          scheduled_at: string
          type: string | null
          status: string
          notes: string | null
        }
      }
      offers: {
        Row: {
          id: string
          submission_id: string
          amount: number | null
          status: string
          extended_at: string | null
          responded_at: string | null
        }
      }
      placements: {
        Row: {
          id: string
          submission_id: string
          candidate_id: string
          mandate_id: string
          client_id: string
          start_date: string | null
          salary: number | null
          fee_percentage: number | null
          fee_amount: number | null
          guarantee_status: string
          status: string
          created_at: string
        }
      }
      invoices: {
        Row: {
          id: string
          placement_id: string
          client_id: string
          invoice_number: string
          amount: number
          status: string
          due_date: string
          sent_date: string | null
          paid_date: string | null
          created_at: string
        }
      }
      interactions: {
        Row: {
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
      }
      checkins: {
        Row: {
          id: string
          placement_id: string
          agent_name: string
          notes: string | null
          created_at: string
        }
      }
      handoffs: {
        Row: {
          id: string
          from_agent: string
          to_agent: string
          entity_type: string
          entity_id: string
          notes: string | null
          created_at: string
        }
      }
      references_: {
        Row: {
          id: string
          candidate_id: string
          name: string
          company: string | null
          title: string | null
          status: string
          notes: string | null
          created_at: string
        }
      }
    }
    Views: {
      pipeline_dashboard: {
        Row: {
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
      }
    }
  }
}

// Browser client (for client components)
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server client (for server components — no cookie handling needed without auth)
export function createServerSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
