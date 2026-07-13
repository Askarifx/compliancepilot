import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://usyctjayb1fkjgcnz1k.supabase.co"
const SUPABASE_KEY = "sb_publishable_II21SXXavg7zu1tcfwEL1A_d91AebMc"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)