import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testProfilesRLS() {
    console.log('--- Testing Profiles Table with SERVICE_ROLE ---')
    const { data: profiles, error } = await supabase.from('profiles').select('*')

    if (error) {
        console.log('Error fetching profiles:', error.message)
    } else {
        console.log('Profiles:', JSON.stringify(profiles, null, 2))
    }

    // Check if RLS is enabled
    const { data: rlsData, error: rlsErr } = await supabase
        .rpc('check_rls', { table_name: 'profiles' })

    if (rlsErr) {
        console.log('Could not check RLS status via RPC.')
    }
}

testProfilesRLS()
