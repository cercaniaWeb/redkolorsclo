'use client'

import { useCartStore } from '@/store/useCartStore'
import { X, Minus, Plus, ShoppingBag, MessageCircle } from 'lucide-react'
import Image from 'next/image'

import { usePathname } from 'next/navigation'

export default function CartSidebar() {
    const { items, isOpen, setIsOpen, removeItem, updateQuantity, getTotal, toggleCart } = useCartStore()
    const pathname = usePathname()

    if (pathname === '/pos') return null
    if (!isOpen) return null

    // Removed handleWhatsAppOrder as it's now secondary inside checkout

    return (
        <>
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-950 border-l border-gray-800 shadow-2xl z-50 flex flex-col transform transition-transform">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-900 bg-gray-950/80 backdrop-blur-md sticky top-0">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-red-500" />
                        <h2 className="text-xl font-bold text-white tracking-tight">Mi Carrito</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-2">
                                <ShoppingBag className="w-10 h-10 text-gray-700" />
                            </div>
                            <p className="text-gray-500 font-medium">Tu carrito está vacío</p>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full text-sm font-bold transition-colors"
                            >
                                Explorar Colección
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800/50 group">
                                {/* Image */}
                                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-900 shrink-0 relative">
                                    <Image
                                        src={item.image_url}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex flex-col justify-between flex-1 py-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-white line-clamp-1 pr-2">{item.title}</h3>
                                            <p className="text-sm text-gray-400 font-medium mt-1">Talla: <span className="text-white">Única</span></p>
                                        </div>
                                        <p className="font-black text-red-500">${item.price.toFixed(2)}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-1 bg-black rounded-lg p-1 border border-gray-800">
                                            <button
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-900 hover:bg-red-600 text-white transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-900 hover:bg-red-600 text-white transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-xs text-red-500 hover:text-red-400 font-medium underline underline-offset-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-gray-900 p-6 bg-black z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-400 font-medium text-lg">Total</span>
                            <span className="text-3xl font-black text-white">${getTotal().toFixed(2)}</span>
                        </div>

                        <button
                            onClick={() => {
                                setIsOpen(false)
                                window.location.href = '/checkout'
                            }}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-lg transition-transform transform hover:-translate-y-1 shadow-xl shadow-rose-900/30"
                        >
                            <ShoppingBag className="w-6 h-6" />
                            Proceder al Pago
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}
