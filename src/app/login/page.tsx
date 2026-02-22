'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                // Redirigir según el rol del perfil
                fetchProfileAndRedirect()
            }
        })
    }, [])

    const fetchProfileAndRedirect = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role === 'admin' || profile?.role === 'cajero') {
            router.push('/admin')
        } else {
            router.push('/')
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            setError('Credenciales incorrectas.')
            setLoading(false)
        } else {
            await fetchProfileAndRedirect()
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center container mx-auto px-4 mt-8 animate-in fade-in zoom-in duration-300">
            <div className="w-full max-w-md bg-gray-950 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-3xl font-black text-white text-center mb-2">Ingresar</h2>
                <p className="text-gray-400 text-center mb-8">Administradores, cajeros y clientes.</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                            placeholder="tu@correo.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-600/20 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Entrando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm">
                        ← Volver a la tienda
                    </Link>
                </div>

                {/* CRENDENCIALES DE PRUEBA */}
                <div className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-2xl text-xs text-gray-400">
                    <h4 className="font-bold text-gray-300 uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">Credenciales de Prueba</h4>
                    <ul className="space-y-3">
                        <li className="flex flex-col">
                            <span className="text-red-500 font-bold uppercase">Rol: Administrador</span>
                            <span className="font-mono">admin@redkolors.com</span>
                            <span className="font-mono">red123456</span>
                        </li>
                        <li className="flex flex-col">
                            <span className="text-blue-500 font-bold uppercase">Rol: Cajero</span>
                            <span className="font-mono">cajero@redkolors.com</span>
                            <span className="font-mono">red123456</span>
                        </li>
                        <li className="flex flex-col">
                            <span className="text-green-500 font-bold uppercase">Rol: Cliente</span>
                            <span className="font-mono">cliente@redkolors.com</span>
                            <span className="font-mono">red123456</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
