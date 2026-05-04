import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hcatsoyfuorayhyqwyhd.supabase.co'
// Using publishable key for client-side auth
const SUPABASE_KEY = 'sb_publishable_h4bNtgDFIcfeTPs_YwnPqA_j5BZuIum'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
