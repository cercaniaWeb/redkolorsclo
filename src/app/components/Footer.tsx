'use client'

import { Facebook, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
    const pathname = usePathname()

    if (pathname === '/pos') return null

    return (
        <footer className="bg-black border-t border-gray-900 pt-16 pb-8 text-gray-400">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                {/* Brand */}
                <div className="col-span-1 md:col-span-1 flex flex-col items-start gap-4">
                    <Link href="/" className="flex items-center gap-1 group">
                        <span className="text-3xl font-black tracking-tight text-red-600 group-hover:text-red-500 transition-colors">
                            RED
                        </span>
                        <span className="text-3xl font-light tracking-widest text-white group-hover:text-gray-300 transition-colors">
                            KOLORS
                        </span>
                    </Link>
                    <p className="text-sm leading-relaxed mt-2 text-gray-500">
                        Moda exclusiva para dama.<br />Dos sucursales, una sola pasión.
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                        <a href="https://www.facebook.com/groups/204246849098372/" target="_blank" className="p-2 bg-gray-900 rounded-full hover:bg-red-900 hover:text-red-500 transition-all text-white border border-gray-800">
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a href="https://www.facebook.com/groups/536739121176220/" target="_blank" className="p-2 bg-gray-900 rounded-full hover:bg-red-900 hover:text-red-500 transition-all text-white border border-gray-800">
                            <Facebook className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Links */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-white font-bold tracking-widest text-sm uppercase">Navegar</h4>
                    <Link href="/tienda" className="hover:text-red-500 transition-colors">Catálogo Completo</Link>
                    <Link href="/#sucursales" className="hover:text-red-500 transition-colors">Nuestras Sucursales</Link>
                    <Link href="/#novedades" className="hover:text-red-500 transition-colors">Novedades y RRSS</Link>
                    <Link href="/admin" className="text-red-500 font-bold hover:text-red-400 bg-red-950/30 px-3 py-1 rounded w-max inline-block transition-colors mt-2 text-xs border border-red-900/50">Admin Panel</Link>
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

            <div className="container mx-auto px-4 border-t border-gray-900 pt-8 flex items-center justify-center">
                <p className="text-xs text-center">
                    © {new Date().getFullYear()} Red Kolors Clothing · <span className="text-red-500">Todos los derechos reservados.</span>
                </p>
            </div>
        </footer>
    )
}
