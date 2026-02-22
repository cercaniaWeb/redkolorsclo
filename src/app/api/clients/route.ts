import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
    try {
        const { email, password, name, phone } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
        }

        // Initialize Supabase client with the SERVICE_ROLE key to bypass RLS and create users as admin
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 1. Create user in Supabase Auth via Admin API
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto confirm so they don't need to check email immediately
            user_metadata: {
                full_name: name,
                phone: phone
            }
        })

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        const newUserId = authData.user.id

        // 2. Ensure their profile is set up as 'cliente' (this might be handled by an auth trigger in DB, but we explicitly update it just in case)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({ id: newUserId, role: 'cliente' }) // Might conflict if auto-trigger exists, but safe upsert is good

        if (profileError) {
            console.error('Error assigning role client:', profileError.message)
            // Even if profile fails, user is created, so we return a partial success or log it.
        }

        return NextResponse.json({ success: true, user: authData.user }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: 'Error del servidor: ' + error.message }, { status: 500 })
    }
}
