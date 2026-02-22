'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useCartStore } from '@/store/useCartStore'
import ProductModal from './ProductModal'

export default function ProductCard({ product }: { product: any }) {
    const addItem = useCartStore((state) => state.addItem)

    const totalStock = product.product_branches?.reduce(
        (acc: number, branch: any) => acc + branch.stock,
        0
    )

    const isOutOfStock = totalStock === 0
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <div className="group relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-red-900/20">

                {/* Clickable Area to Open Modal */}
                <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] bg-white overflow-hidden">
                        <Image
                            src={product.image_url}
                            alt={product.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className={`object-cover object-top transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                        />

                        {isOutOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                <span className="text-white font-bold tracking-widest px-4 py-2 bg-red-600/90 rounded border border-red-500">
                                    AGOTADO
                                </span>
                            </div>
                        )}

                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                            {product.product_branches?.map((b: any) => {
                                const branchNames: Record<string, string> = {
                                    simon: 'S. Bolívar',
                                    floresta: 'Floresta',
                                    pantitlan: 'Pantitlán'
                                }
                                return (
                                    <span
                                        key={b.branch_id}
                                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-950/80 backdrop-blur-md text-white rounded-md border border-gray-700/50"
                                        title={`Stock: ${b.stock}`}
                                    >
                                        {branchNames[b.branch_id] || b.branch_id}
                                    </span>
                                )
                            })}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5 pb-2">
                        <h3 className="text-lg font-bold text-white mb-1 truncate">
                            {product.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {product.description}
                        </p>
                    </div>
                </div>

                {/* Footer with Price and Button */}
                <div className="px-5 pb-5">
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-white">
                            ${product.price}
                        </span>
                        <button
                            onClick={() => {
                                if (!isOutOfStock) {
                                    addItem({
                                        id: product.id,
                                        title: product.title,
                                        price: product.price,
                                        image_url: product.image_url,
                                    })
                                }
                            }}
                            className={`px-4 py-2 font-medium rounded-lg transition-all ${isOutOfStock
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 active:scale-95'
                                }`}
                            disabled={isOutOfStock}
                        >
                            Comprar
                        </button>
                    </div>
                </div>
            </div>

            {/* Render the Modal independently */}
            <ProductModal
                product={product}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
