'use client'

import { Facebook, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './Logo'

import { useState, useEffect } from 'react'

export default function Footer() {
    const [isStandalone, setIsStandalone] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsStandalone(true)
        }
    }, [])

    if (pathname === '/pos') return null

    return (
        <footer className="bg-[#020617] border-t border-white/5 pt-20 pb-10 text-slate-400">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                {/* Brand */}
                <div className="col-span-1 md:col-span-1 flex flex-col items-start gap-6">
                    <Link href="/" className="group hover:opacity-80 transition-opacity">
                        <Logo scale={0.7} className="-ml-6" />
                    </Link>
                    <p className="text-sm leading-relaxed mt-2 text-gray-500">
                        Moda exclusiva para dama.<br />Tres sucursales, una sola pasión.
                    </p>
                    <div className="flex flex-col gap-3 mt-4">
                        <a href="https://www.facebook.com/groups/204246849098372/" target="_blank" className="flex items-center gap-3 group">
                            <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-rose-600 transition-all text-white border border-white/5">
                                <Facebook className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">Floresta</span>
                        </a>
                        <a href="https://www.facebook.com/groups/536739121176220/" target="_blank" className="flex items-center gap-3 group">
                            <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-rose-600 transition-all text-white border border-white/5">
                                <Facebook className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">Pantitlán</span>
                        </a>
                    </div>
                </div>

                {/* Links */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-white font-bold tracking-widest text-sm uppercase">Navegar</h4>
                    <Link href="/tienda" className="hover:text-red-500 transition-colors">Catálogo Completo</Link>
                    <Link href="/#sucursales" className="hover:text-red-500 transition-colors">Nuestras Sucursales</Link>
                    <Link href="/#novedades" className="hover:text-red-500 transition-colors">Novedades y RRSS</Link>
                    {!isStandalone && (
                        <Link href="/admin" className="text-red-500 font-bold hover:text-red-400 bg-red-950/30 px-3 py-1 rounded w-max inline-block transition-colors mt-2 text-xs border border-red-900/50">Admin Panel</Link>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-white font-bold tracking-widest text-sm uppercase">Información</h4>
                    <a href="#" className="hover:text-red-500 transition-colors">Política de Cambios</a>
                    <a href="#" className="hover:text-red-500 transition-colors">Envíos</a>
                    <a href="#" className="hover:text-red-500 transition-colors">Contacto</a>
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col items-start gap-4">
                    <h4 className="text-white font-bold tracking-widest text-sm uppercase">¿Dudas?</h4>
                    <p className="text-sm text-gray-500 mb-2">Contáctanos directo para atención personalizada.</p>
                    <a href="https://wa.me/521" target="_blank" className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full font-semibold transition-transform transform hover:-translate-y-1 shadow-lg shadow-green-900/20">
                        <MessageCircle className="w-5 h-5" />
                        Escríbenos por WhatsApp
                    </a>
                </div>
            </div>

            <div className="container mx-auto px-6 border-t border-white/5 pt-10 flex items-center justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-center opacity-40">
                    © 2026 Red Kolors Clothing · <span className="text-rose-600">Premium Fashion Experience</span>
                </p>
            </div>
        </footer>
    )
}
