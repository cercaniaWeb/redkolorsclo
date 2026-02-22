import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkOrSetupSettings() {
    console.log('--- Checking for store_settings table ---')
    const { data: tables, error: tablesErr } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)

    if (tablesErr) {
        console.log('Table store_settings might not exist:', tablesErr.message)
        console.log('We should create it using SQL.')
    } else {
        console.log('Table store_settings exists:', tables)
    }
}

checkOrSetupSettings()
