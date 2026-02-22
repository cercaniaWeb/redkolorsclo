import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    console.log(`[Middleware] Processing ${pathname}`)

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (user) console.log(`[Middleware] User detected: ${user.email}`)

    // Protect administrative routes
    if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/pos')) {
        if (!user) {
            console.log(`[Middleware] Unauthorized: No user session. Redirecting to /login`)
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Deep role check via profiles table
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (error) {
            console.error(`[Middleware] Profile fetch error for ${user.email}:`, error.message)
        }

        console.log(`[Middleware] Role check for ${user.email}: ${profile?.role}`)

        if (!profile || (profile.role !== 'admin' && profile.role !== 'cajero')) {
            console.log(`[Middleware] Forbidden: Role ${profile?.role || 'null'} not allowed. Redirecting.`)
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return response
}

export const config = {
    matcher: ['/admin/:path*', '/pos/:path*'],
}
