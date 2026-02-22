'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, User, ShieldCheck, ShoppingBag, Sparkles, Building } from 'lucide-react'
import Logo from '../components/Logo'

export default function LoginPage() {
    const [portal, setPortal] = useState<'public' | 'staff'>('public')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                redirectByRole(session.user.id)
            }
        })
    }, [])

    const redirectByRole = async (userId: string) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Profile fetch error:', error.message)
                // If we can't determine role, go home (customer fallback)
                router.push('/')
                return
            }

            if (profile?.role === 'admin' || profile?.role === 'cajero') {
                router.push('/admin')
            } else {
                router.push('/')
            }
        } catch (err) {
            console.error('Unexpected error during redirect:', err)
            router.push('/')
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) {
                setError('Credenciales incorrectas. Verifica tu email y contraseña.')
                return
            }

            if (!data.user) {
                setError('No se pudo obtener la sesión. Intenta de nuevo.')
                return
            }

            await redirectByRole(data.user.id)
            // Note: after router.push, this component unmounts — no need to setLoading(false)
        } catch (err) {
            setError('Error de conexión. Intenta de nuevo.')
        } finally {
            // Only runs if component is still mounted (i.e., redirect failed)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020617] px-4 py-20 selection:bg-rose-500/30">
            {/* Dynamic Background Accents */}
            <div className={`absolute top-0 left-0 w-full h-full transition-colors duration-1000 -z-10 ${portal === 'public' ? 'bg-gradient-to-tr from-rose-600/5 via-transparent to-blue-600/5' : 'bg-gradient-to-bl from-slate-900 via-transparent to-rose-950/20'}`}></div>
            <div className={`absolute -top-40 -right-40 w-96 h-96 blur-[150px] transition-colors duration-1000 ${portal === 'public' ? 'bg-rose-600/20' : 'bg-slate-500/10'}`}></div>
            <div className={`absolute -bottom-40 -left-40 w-96 h-96 blur-[150px] transition-colors duration-1000 ${portal === 'public' ? 'bg-blue-600/10' : 'bg-rose-900/10'}`}></div>

            <div className="w-full max-w-xl flex flex-col gap-10">
                {/* Logo & Portal Switcher */}
                <div className="flex flex-col items-center gap-8 animate-reveal">
                    <Link href="/" className="hover:scale-105 transition-transform"><Logo scale={1.2} /></Link>

                    <div className="bg-slate-900/50 p-1.5 rounded-[2rem] border border-white/5 flex items-center shadow-2xl backdrop-blur-md">
                        <button
                            onClick={() => { setPortal('public'); setError(null); }}
                            className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-[0.15em] transition-all ${portal === 'public' ? 'bg-white text-black shadow-xl shadow-white/5 scale-105' : 'text-slate-500 hover:text-white'}`}
                        >
                            <ShoppingBag className={`w-4 h-4 ${portal === 'public' ? 'text-rose-600' : ''}`} /> Cliente
                        </button>
                        <button
                            onClick={() => { setPortal('staff'); setError(null); }}
                            className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-[0.15em] transition-all ${portal === 'staff' ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/30 scale-105' : 'text-slate-500 hover:text-white'}`}
                        >
                            <ShieldCheck className="w-4 h-4" /> Personal
                        </button>
                    </div>
                </div>

                <div className="glass rounded-[3rem] p-10 md:p-14 border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden animate-reveal delay-100">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        {portal === 'public' ? <Sparkles className="w-24 h-24 text-white" /> : <Building className="w-24 h-24 text-white" />}
                    </div>

                    <div className="relative space-y-10">
                        <div className="space-y-3">
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                {portal === 'public' ? 'Bienvenido a ' : 'Terminal '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-200">{portal === 'public' ? 'Red Kolors' : 'Operativa'}</span>
                            </h2>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                {portal === 'public'
                                    ? 'Accede a tu perfil de moda y acumula puntos de fidelidad.'
                                    : 'Apertura de caja y gestión administrativa centralizada.'}
                            </p>
                        </div>

                        {error && (
                            <div className="bg-rose-600/10 border border-rose-500/20 text-rose-500 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] pl-1">
                                    Identificador Operativo
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-rose-500/50 focus:bg-black/60 transition-all font-medium text-lg placeholder:text-slate-800"
                                    placeholder={portal === 'public' ? 'tu@correo.com' : 'empleado@redkolors.com'}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] pl-1">
                                    Clave de Acceso
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-rose-500/50 focus:bg-black/60 transition-all font-medium text-lg placeholder:text-slate-800"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full group relative flex items-center justify-center gap-4 py-5 rounded-[2rem] font-black text-xl tracking-tight transition-all active:scale-95 disabled:opacity-50 ${portal === 'public' ? 'bg-white text-black shadow-2xl shadow-white/5 hover:bg-slate-100' : 'bg-rose-600 text-white shadow-2xl shadow-rose-600/20 hover:bg-rose-500'}`}
                            >
                                {loading ? 'Validando...' : (portal === 'public' ? 'Iniciar Experiencia' : 'Ingresar a Caja')}
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>

                        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                            <Link href="/" className="text-slate-500 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" /> Volver a la Galería
                            </Link>
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Digital Core © 2026</p>
                        </div>
                    </div>
                </div>

                {/* CRENDENCIALES DE PRUEBA (SOLO PARA DESARROLLO) */}
                <div className="p-8 bg-slate-900/20 border border-white/5 rounded-[2rem] backdrop-blur-sm animate-reveal delay-200">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4" /> Depuración de Accesos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { role: 'Admin', email: 'admin@redkolors.com', color: 'text-rose-500' },
                            { role: 'Cajero', email: 'cajero@redkolors.com', color: 'text-blue-500' },
                            { role: 'Cliente', email: 'cliente@redkolors.com', color: 'text-emerald-500' }
                        ].map(c => (
                            <div key={c.role} className="space-y-1">
                                <p className={`text-[10px] font-black uppercase ${c.color}`}>{c.role}</p>
                                <p className="text-xs text-slate-400 font-mono italic truncate">{c.email}</p>
                                <p className="text-xs text-slate-600 font-mono">red123456</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
