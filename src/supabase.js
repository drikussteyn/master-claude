import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hcatsoyfuorayhyqwyhd.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_h4bNtgDFIcfeTPs_YwnPqA_j5BZuIum'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
