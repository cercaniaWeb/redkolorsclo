'use client'

import Image from 'next/image'
import { X, ShoppingBag, MessageCircle, MapPin } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { useState } from 'react'

interface ProductModalProps {
    product: any
    isOpen: boolean
    onClose: () => void
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
    const addItem = useCartStore((state) => state.addItem)
    const [selectedSize, setSelectedSize] = useState<string | null>(null)

    if (!isOpen || !product) return null

    // Calculate stock
    const branches = product.product_branches || []
    const totalStock = branches.reduce((acc: number, branch: any) => acc + branch.stock, 0)
    const isOutOfStock = totalStock === 0

    const handleAddToCart = () => {
        if (isOutOfStock) return
        addItem({
            id: product.id,
            title: product.title + (selectedSize ? ` (Talla ${selectedSize})` : ''),
            price: product.price,
            image_url: product.image_url,
        })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-1/2 relative bg-white aspect-[3/4] md:aspect-auto">
                    <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        className="object-cover object-top"
                    />
                </div>

                {/* Info Section */}
                <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
                    <div className="mb-2">
                        <span className="inline-block px-3 py-1 bg-red-600/20 text-red-500 text-xs tracking-widest font-bold uppercase rounded-full border border-red-500/30">
                            {product.category || 'Nuevo'}
                        </span>
                    </div>

                    <h2 className="text-3xl font-black text-white mb-2">{product.title}</h2>
                    <p className="text-3xl font-bold text-red-500 mb-6">${product.price.toFixed(2)}</p>

                    <div className="prose prose-invert mb-8">
                        <p className="text-gray-400 leading-relaxed">{product.description}</p>
                    </div>

                    {/* Sizes (Mocked for now since they aren't in DB yet) */}
                    <div className="mb-8">
                        <h4 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-3">Talla</h4>
                        <div className="flex gap-3">
                            {['S', 'M', 'L', 'XL'].map((talla) => (
                                <button
                                    key={talla}
                                    onClick={() => setSelectedSize(talla)}
                                    className={`w-12 h-12 flex items-center justify-center rounded-xl border text-sm font-bold transition-all ${selectedSize === talla
                                        ? 'border-red-500 bg-red-600 shadow-lg shadow-red-600/20 text-white'
                                        : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    {talla}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Availability */}
                    <div className="mb-8 p-4 bg-gray-900 border border-gray-800 rounded-2xl">
                        <h4 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Disponibilidad
                        </h4>
                        <div className="space-y-2">
                            {branches.map((b: any) => {
                                const branchMap: Record<string, string> = {
                                    simon: 'Simón Bolívar',
                                    floresta: 'Floresta',
                                    pantitlan: 'Pantitlán'
                                }
                                return (
                                    <div key={b.branch_id} className="flex justify-between text-sm">
                                        <span className="text-white font-medium capitalize">Sucursal {branchMap[b.branch_id] || b.branch_id}</span>
                                        <span className={b.stock > 0 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                                            {b.stock > 0 ? `${b.stock} en stock` : 'Agotado'}
                                        </span>
                                    </div>
                                )
                            })}
                            {totalStock === 0 && (
                                <div className="text-red-500 text-sm font-bold mt-2">Producto totalmente agotado.</div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex flex-col gap-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all ${isOutOfStock
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-600/20 active:scale-95'
                                }`}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {isOutOfStock ? 'Agotado' : 'Agregar al carrito'}
                        </button>
                        <button
                            onClick={() => window.open(`https://wa.me/529999999999?text=Hola, quiero información sobre el producto: ${product.title}`, '_blank')}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg bg-gray-900 hover:bg-gray-800 text-white border border-gray-800 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5 text-green-500" />
                            Preguntar por WhatsApp
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
