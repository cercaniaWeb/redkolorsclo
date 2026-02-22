import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testRLS() {
    console.log('--- Testing RLS with Anon Key (No Auth) ---')
    const { data, error } = await supabase.from('sales').select('*')

    if (error) {
        console.log('Access restricted (expected if RLS is on):', error.message)
    } else {
        console.log('Data fetched with Anon Key:', data.length, 'records')
        if (data.length > 0) {
            console.log('⚠️ WARNING: RLS might not be fully restrictive on "sales" table.')
        } else {
            console.log('✅ RLS seems to be working for "sales" table.')
        }
    }
}

testRLS()
