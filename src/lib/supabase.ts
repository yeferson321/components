import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL
const supabasePublishableKey = import.meta.env.SUPABASE_KEY

export function createServerClient() {
    return createClient(supabaseUrl, supabasePublishableKey)
};