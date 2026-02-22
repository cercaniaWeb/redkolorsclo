'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useCartStore } from '@/store/useCartStore'
import ProductModal from './ProductModal'
import { ShoppingBag, ZoomIn, Eye, Sparkles, MessageCircle } from 'lucide-react'

export default function ProductCard({ product }: { product: any }) {
    const addItem = useCartStore((state) => state.addItem)
    const toggleCart = useCartStore((state) => state.toggleCart)

    const totalStock = product.product_branches?.reduce(
        (acc: number, branch: any) => acc + branch.stock,
        0
    )

    const isOutOfStock = totalStock === 0
    const [isCartAdding, setIsCartAdding] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleAddToCart = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image_url: product.image_url,
        })
        setIsCartAdding(true)
        setTimeout(() => setIsCartAdding(false), 2000)
    }

    return (
        <>
            <div className="group relative bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-rose-500/30 hover:shadow-[0_20px_50px_rgba(225,29,72,0.1)] flex flex-col items-stretch">
                {/* Image Section */}
                <div className="relative aspect-[3/4] overflow-hidden bg-white">
                    <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className={`object-contain p-6 transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                    />

                    {/* Floating Stock Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 max-w-[80%]">
                        {product.product_branches?.filter((b: any) => b.stock > 0).map((b: any) => {
                            const branchShortNames: Record<string, string> = {
                                simon: 'Bolívar',
                                floresta: 'Floresta',
                                pantitlan: 'Pantitlán'
                            }
                            return (
                                <span key={b.branch_id} className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 bg-slate-950/80 backdrop-blur-md text-slate-300 rounded-full border border-white/10 shadow-xl">
                                    {branchShortNames[b.branch_id] || b.branch_id}
                                </span>
                            )
                        })}
                    </div>

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl hover:bg-rose-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                        <a
                            href={`https://wa.me/521?text=Hola RedKolors! Vi este modelo en el Live y quiero apartarlo: ${encodeURIComponent(product.title)}`}
                            target="_blank"
                            className="w-12 h-12 bg-[#25D366] text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-all transform translate-y-4 group-hover:translate-y-0 [transition-delay:25ms] duration-500"
                            title="Apartar por WhatsApp (Live)"
                        >
                            <MessageCircle className="w-5 h-5" />
                        </a>
                        {!isOutOfStock && (
                            <button
                                onClick={handleAddToCart}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all transform translate-y-4 group-hover:translate-y-0 [transition-delay:50ms] duration-500 ${isCartAdding ? 'bg-green-500 text-white' : 'bg-rose-600 text-white hover:bg-rose-500'}`}
                            >
                                {isCartAdding ? <Sparkles className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                            </button>
                        )}
                    </div>

                    {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase px-4 py-2 bg-slate-900/90 text-white rounded-full border border-white/10">
                                Agotado
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-8 space-y-4 flex-1 flex flex-col">
                    <div className="space-y-1">
                        <div className="flex justify-between items-start gap-4">
                            <h3 className="text-xl font-black text-white tracking-tight line-clamp-1 leading-tight">{product.title}</h3>
                            <span className="text-rose-500 font-black text-xl leading-tight shrink-0">${product.price}</span>
                        </div>
                        <p className="text-slate-500 text-sm italic font-medium">Nueva Colección</p>
                    </div>

                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                        {product.description || 'Prenda exclusiva diseñada con los más altos estándares de calidad y estilo.'}
                    </p>

                    <div className="pt-4 mt-auto">
                        <button
                            onClick={() => !isOutOfStock && (isCartAdding ? toggleCart() : handleAddToCart())}
                            className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isOutOfStock
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5'
                                : isCartAdding
                                    ? 'bg-green-500/10 border-green-500/50 text-green-500'
                                    : 'bg-transparent border border-white/10 hover:border-rose-500/50 hover:bg-rose-500/5 text-slate-300 hover:text-white'
                                }`}
                            disabled={isOutOfStock}
                        >
                            {isOutOfStock ? 'No disponible' : isCartAdding ? '¡Añadido al Carrito!' : 'Añadir al Carrito'}
                        </button>
                    </div>
                </div>
            </div>

            <ProductModal
                product={product}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
