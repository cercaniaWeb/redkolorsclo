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

    const handleWhatsAppOrder = () => {
        let message = "Hola, me gustaría pedir los siguientes productos:%0A%0A"
        items.forEach(item => {
            message += `- ${item.quantity}x ${item.title} ($${item.price.toFixed(2)} c/u)%0A`
        })
        message += `%0A*Total: $${getTotal().toFixed(2)}*`

        // Replace this with your actual WhatsApp number for Red Kolors
        const whatsappNumber = "529999999999"
        const url = `https://wa.me/${whatsappNumber}?text=${message}`
        window.open(url, '_blank')
    }

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

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scroll-smooth">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                            <ShoppingBag className="w-16 h-16 text-gray-800" />
                            <p className="text-lg">Tu carrito está vacío 🛍️</p>
                            <button
                                onClick={toggleCart}
                                className="mt-4 px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full border border-gray-800 transition-colors"
                            >
                                Seguir comprando
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 p-4 bg-gray-900/50 border border-gray-800/50 rounded-2xl hover:bg-gray-900 transition-colors relative group">
                                {/* Image */}
                                <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-white shrink-0 shadow-lg">
                                    <Image
                                        src={item.image_url}
                                        alt={item.title}
                                        fill
                                        className="object-cover object-top"
                                        sizes="96px"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex flex-col justify-between flex-1 py-1">
                                    <div>
                                        <h4 className="font-bold text-gray-100 text-sm line-clamp-2 leading-snug">{item.title}</h4>
                                        <p className="text-red-500 font-bold mt-1 text-lg">${item.price.toFixed(2)}</p>
                                    </div>

                                    {/* Quantity and Actions */}
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-1 bg-black rounded-lg border border-gray-800 p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 hover:text-red-500 text-gray-400 hover:bg-gray-800 rounded-md transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium text-white select-none">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 hover:text-red-500 text-gray-400 hover:bg-gray-800 rounded-md transition-colors"
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
                            onClick={handleWhatsAppOrder}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition-transform transform hover:-translate-y-1 shadow-xl shadow-green-900/30"
                        >
                            <MessageCircle className="w-6 h-6" />
                            Pedir por WhatsApp
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}
