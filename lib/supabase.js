
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL atau API Key belum dikonfigurasi. Periksa file .env.local'
  )
}

if (!supabaseUrl.startsWith('https://')) {
  throw new Error('Supabase URL harus menggunakan HTTPS')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
