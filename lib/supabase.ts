import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zjizyooehjyaxqcbvvxi.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaXp5b29laGp5YXhxY2J2dnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDEzODIsImV4cCI6MjA4NDgxNzM4Mn0.8f1wqTXB7X-12zWkkIxJjPyxjni9MnS56-MINS52Rkk'

export function createBrowserSupabaseClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export function createServerSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
