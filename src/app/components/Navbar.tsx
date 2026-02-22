'use client'

import Link from 'next/link'
import { ShoppingCart, MapPin, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const { items, toggleCart } = useCartStore()

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

    const tabs = [
        { name: 'Inicio', href: '/' },
        { name: 'Tienda', href: '/tienda' },
    ]

    if (pathname === '/pos') return null

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-gray-900 shadow-xl">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1 group">
                    <span className="text-2xl font-black tracking-tight text-red-600 group-hover:text-red-500 transition-colors">
                        RED
                    </span>
                    <span className="text-2xl font-light tracking-widest text-white group-hover:text-gray-300 transition-colors">
                        KOLORS
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`text-sm font-medium transition-colors hover:text-white ${pathname === tab.href ? 'text-red-500' : 'text-gray-400'
                                }`}
                        >
                            {tab.name}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/#sucursales"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-full text-sm font-medium text-gray-300 transition-colors"
                    >
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span>Sucursales</span>
                    </Link>

                    <button
                        onClick={toggleCart}
                        className="relative p-2 text-gray-400 hover:text-white transition-colors cursor-pointer group"
                    >
                        <ShoppingCart className="w-6 h-6 transform group-hover:-translate-y-1 transition-transform" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-black animate-pulse">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-400 hover:text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-gray-950 border-b border-gray-900 p-4 flex flex-col gap-4 shadow-2xl">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            onClick={() => setIsOpen(false)}
                            className={`text-lg font-medium ${pathname === tab.href ? 'text-red-500' : 'text-gray-400'
                                }`}
                        >
                            {tab.name}
                        </Link>
                    ))}
                    <Link
                        href="/#sucursales"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 text-gray-400 py-2 border-t border-gray-900 mt-2"
                    >
                        <MapPin className="w-5 h-5 text-red-500" />
                        <span>Ver Sucursales</span>
                    </Link>
                </div>
            )}
        </nav>
    )
}
