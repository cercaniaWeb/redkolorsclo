'use client'

import Link from 'next/link'
import { ShoppingCart, MapPin, Menu, X, User, ShieldCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { supabase } from '@/lib/supabase'
import Logo from './Logo'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [session, setSession] = useState<any>(null)
    const pathname = usePathname()
    const { items, toggleCart } = useCartStore()

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)
    const [isCartAnimating, setIsCartAnimating] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setSession(session)
            if (session) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
                if (profile) setUserRole(profile.role)
            }
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (session) {
                supabase.from('profiles').select('role').eq('id', session.user.id).single()
                    .then(({ data }) => { if (data) setUserRole(data.role) })
            } else {
                setUserRole(null)
            }
        })

        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)

        // Detect Standalone Mode (PWA)
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsStandalone(true)
        }

        return () => {
            window.removeEventListener('scroll', handleScroll)
            subscription.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (cartCount > 0) {
            setIsCartAnimating(true)
            const timer = setTimeout(() => setIsCartAnimating(false), 400)
            return () => clearTimeout(timer)
        }
    }, [cartCount])

    const tabs = [
        { name: 'Inicio', href: '/' },
        { name: 'Catálogo', href: '/tienda' },
    ]

    // Don't show navbar in standalone or specialized flows
    const hiddenRoutes = ['/pos', '/admin', '/login', '/perfil', '/checkout']
    if (hiddenRoutes.includes(pathname)) return null

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-500 px-4 md:px-8 py-4 ${scrolled ? 'pt-4' : 'pt-6'}`}>
            <nav className={`container mx-auto h-16 md:h-20 transition-all duration-500 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-between px-6 md:px-10 border shadow-2xl ${scrolled
                ? 'bg-slate-950/80 backdrop-blur-xl border-white/10 shadow-black/50'
                : 'bg-transparent border-transparent shadow-none'
                }`}>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group hover:scale-105 transition-transform">
                    <Logo scale={0.8} />
                </Link>

                {/* Desktop Links - Floating Pill Style */}
                <div className="hidden md:flex items-center bg-white/5 backdrop-blur-sm border border-white/5 px-2 py-1.5 rounded-full shadow-inner">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-full ${pathname === tab.href
                                ? 'bg-white text-black shadow-lg'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {tab.name}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 md:gap-5">
                    <Link
                        href="/#sucursales"
                        className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5 active:scale-95"
                    >
                        <MapPin className="w-4 h-4 text-rose-600" />
                        Sedes
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleCart}
                            className={`w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white transition-all active:scale-90 relative group ${isCartAnimating ? 'animate-cart-pop' : ''}`}
                        >
                            <ShoppingCart className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-[10px] font-black text-white flex items-center justify-center rounded-lg shadow-lg shadow-rose-600/30 animate-reveal">
                                    {cartCount}
                                </span>
                            )}
                        </button>


                        {!isStandalone && (
                            <Link
                                href={!session ? '/login' : (userRole === 'admin' || userRole === 'cajero' ? '/admin' : '/perfil')}
                                className="w-12 h-12 hidden md:flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90"
                            >
                                <User className="w-5 h-5" />
                            </Link>
                        )}

                        <button
                            className="md:hidden w-12 h-12 flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl text-white active:scale-90"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu - Enhanced */}
            {isOpen && (
                <div className="md:hidden fixed inset-x-4 top-24 bg-slate-950/95 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] flex flex-col gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-reveal z-50">
                    <div className="flex flex-col gap-3">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                onClick={() => setIsOpen(false)}
                                className={`text-2xl font-black tracking-tight flex items-center justify-between ${pathname === tab.href ? 'text-rose-500' : 'text-white'
                                    }`}
                            >
                                {tab.name}
                                <ArrowRight className={`w-6 h-6 ${pathname === tab.href ? 'opacity-100' : 'opacity-20'}`} />
                            </Link>
                        ))}
                    </div>
                    <div className="h-px bg-white/5"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href="/#sucursales"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest bg-white text-black py-4 rounded-2xl"
                        >
                            <MapPin className="w-4 h-4 text-rose-600" />
                            Sedes
                        </Link>
                        {!isStandalone && (
                            <Link
                                href={!session ? '/login' : (userRole === 'admin' || userRole === 'cajero' ? '/admin' : '/perfil')}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest bg-slate-900 text-white py-4 rounded-2xl border border-white/5"
                            >
                                <User className="w-4 h-4" />
                                {!session ? 'Ingresar' : 'Mi Perfil'}
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
    )
}
