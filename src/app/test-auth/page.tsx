import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function TestAuthPage() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div className="p-20 text-white bg-black min-h-screen font-mono">
                <h1 className="text-red-500 text-2xl mb-4">No User Session Found in Cookies</h1>
                <p>Please log in first.</p>
            </div>
        )
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="p-20 text-white bg-black min-h-screen font-mono">
            <h1 className="text-emerald-500 text-2xl mb-4">User Session Found!</h1>
            <pre className="p-4 bg-slate-900 rounded border border-white/10">
                {JSON.stringify({ user, profile }, null, 2)}
            </pre>
        </div>
    )
}
