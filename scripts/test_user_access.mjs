import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testUserAccess(email, password) {
    console.log(`--- Testing access for ${email} ---`)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (authErr) {
        console.error('Login failed:', authErr.message)
        return
    }

    console.log('Login success! User ID:', auth.user.id)

    // Test profile access
    const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', auth.user.id)
        .single()

    if (profErr) {
        console.error('Profile read FAILED:', profErr.message)
    } else {
        console.log('Profile read success:', profile)
    }

    await supabase.auth.signOut()
}

// Test accounts from scripts/test_admin.mjs context
// admin@redkolors.com / red123456
// cajero@redkolors.com / red123456

async function run() {
    await testUserAccess('admin@redkolors.com', 'red123456')
    console.log('\n')
    await testUserAccess('cajero@redkolors.com', 'red123456')
}

run()
