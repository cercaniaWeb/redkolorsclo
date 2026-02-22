import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkProductColumns() {
    const { data, error } = await supabase.from('products').select('*').limit(1)
    if (data && data.length > 0) {
        console.log('Columns in products table:', Object.keys(data[0]))
    } else {
        console.log('No products found or error:', error)
    }
}

checkProductColumns()
