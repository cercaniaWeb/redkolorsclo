import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Test with ANON key (simulates an unauthenticated browser client)
const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Test with SERVICE ROLE (admin access)
const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testLoginFlow() {
    console.log('--- Step 1: Sign in as cajero ---')
    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
        email: 'cajero@redkolors.com',
        password: 'red123456'
    })

    if (authError) {
        console.error('Login failed:', authError.message)
        return
    }

    console.log('Login successful! User ID:', authData.user?.id)
    console.log('Access token exists:', !!authData.session?.access_token)

    console.log('\n--- Step 2: Fetch own profile after login ---')
    const { data: profile, error: profileError } = await anonClient
        .from('profiles')
        .select('role')
        .eq('id', authData.user?.id)
        .single()

    if (profileError) {
        console.error('PROFILE FETCH FAILED:', profileError.message)
        console.log('This is the cause of the login hang! RLS is blocking the profiles read.')
    } else {
        console.log('Profile fetched successfully:', profile)
    }

    // Cleanup: sign out
    await anonClient.auth.signOut()
}

testLoginFlow()
