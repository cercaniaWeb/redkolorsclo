import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testConnection() {
    console.log('--- Testing Supabase Connection with Service Role ---')
    const { data: profiles, error } = await supabase.from('profiles').select('*').limit(5)

    if (error) {
        console.error('Error fetching profiles:', error)
    } else {
        console.log('Profiles found:', profiles ? profiles.length : 0)
        console.log('Sample profiles:', JSON.stringify(profiles, null, 2))
    }
}

testConnection()
