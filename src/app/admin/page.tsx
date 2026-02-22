'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Trash2, Edit, Plus, RefreshCw, Upload, LogOut } from 'lucide-react'

export default function AdminDashboard() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState<string | null>(null)
    const router = useRouter()

    const fetchProducts = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('products')
            .select('*, product_branches(*)')
            .order('created_at', { ascending: false })

        if (data) setProducts(data)
        setLoading(false)
    }

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role === 'admin' || profile?.role === 'cajero') {
                setRole(profile.role)
                fetchProducts()
            } else {
                router.push('/login')
            }
        }
        checkAuth()
    }, [])

    const deleteProduct = async (id: string, imageUrl: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto y todo su stock?')) return

        // Attempt to extract the file name from the URL to delete from storage
        try {
            const fileName = imageUrl.split('/').pop()
            if (fileName) {
                await supabase.storage.from('products').remove([fileName])
            }
        } catch (e) { }

        await supabase.from('products').delete().eq('id', id)
        fetchProducts()
    }

    const updateStock = async (branchId: string, productId: string, currentStock: number, change: number) => {
        const newStock = Math.max(0, currentStock + change)
        await supabase
            .from('product_branches')
            .update({ stock: newStock, updated_at: new Date().toISOString() })
            .match({ product_id: productId, branch_id: branchId })

        fetchProducts() // Refresh to show new stock
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-black text-white">Panel de Administración</h1>
                    <p className="text-gray-400 mt-2">Gestiona el inventario de tus tres sucursales y publicaciones automatizadas.</p>
                    {role && (
                        <span className="inline-block mt-3 bg-red-600/20 text-red-500 px-3 py-1 rounded text-xs font-bold uppercase border border-red-500/30">
                            Rol actual: {role}
                        </span>
                    )}
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                    <button
                        onClick={() => router.push('/pos')}
                        className="flex items-center gap-2 px-6 py-3 bg-red-900/20 text-red-500 border border-red-500/30 hover:bg-red-900/40 rounded-xl transition-all font-bold"
                        title="Ir a Punto de Venta"
                    >
                        Punto de Venta
                    </button>
                    <button
                        onClick={fetchProducts}
                        className="p-3 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-xl transition-colors"
                        title="Refrescar datos"
                    >
                        <RefreshCw className={`w-5 h-5 text-gray-300 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    {role === 'admin' && (
                        <button
                            onClick={() => alert('Función de "Añadir Nuevo" en construcción!')}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all"
                        >
                            <Plus className="w-5 h-5" /> Nuevo Producto
                        </button>
                    )}
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut()
                            router.push('/login')
                        }}
                        className="flex items-center gap-2 p-3 bg-gray-900 border border-gray-800 hover:bg-red-900 hover:text-red-500 hover:border-red-500 text-gray-400 rounded-xl transition-all"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/50 border-b border-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                                <th className="p-4 font-bold">Producto</th>
                                <th className="p-4 font-bold">Precio</th>
                                <th className="p-4 font-bold text-center">Stock S. Bolívar</th>
                                <th className="p-4 font-bold text-center">Stock Floresta</th>
                                <th className="p-4 font-bold text-center">Stock Pantitlán</th>
                                <th className="p-4 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {products.map((p) => {
                                const getStock = (branch: string) => {
                                    const b = p.product_branches?.find((pb: any) => pb.branch_id === branch)
                                    return b ? b.stock : 0
                                }

                                return (
                                    <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="p-4 flex items-center gap-4">
                                            <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-gray-800 bg-white shrink-0">
                                                <Image src={p.image_url} alt={p.title} fill className="object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm line-clamp-2 md:w-64">{p.title}</p>
                                                <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-800/50 mt-1 inline-block">
                                                    Automático (IA)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-red-500">${p.price}</td>

                                        {/* Simón */}
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => updateStock('simon', p.id, getStock('simon'), -1)} className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 font-bold text-gray-300">-</button>
                                                <span className={`w-6 font-medium ${getStock('simon') > 0 ? 'text-white' : 'text-red-500'}`}>{getStock('simon')}</span>
                                                <button onClick={() => updateStock('simon', p.id, getStock('simon'), 1)} className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 font-bold text-gray-300">+</button>
                                            </div>
                                        </td>

                                        {/* Floresta */}
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => updateStock('floresta', p.id, getStock('floresta'), -1)} className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 font-bold text-gray-300">-</button>
                                                <span className={`w-6 font-medium ${getStock('floresta') > 0 ? 'text-white' : 'text-red-500'}`}>{getStock('floresta')}</span>
                                                <button onClick={() => updateStock('floresta', p.id, getStock('floresta'), 1)} className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 font-bold text-gray-300">+</button>
                                            </div>
                                        </td>

                                        {/* Pantitlán */}
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => updateStock('pantitlan', p.id, getStock('pantitlan'), -1)} className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 font-bold text-gray-300">-</button>
                                                <span className={`w-6 font-medium ${getStock('pantitlan') > 0 ? 'text-white' : 'text-red-500'}`}>{getStock('pantitlan')}</span>
                                                <button onClick={() => updateStock('pantitlan', p.id, getStock('pantitlan'), 1)} className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 font-bold text-gray-300">+</button>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-right">
                                            {role === 'admin' && (
                                                <button
                                                    onClick={() => deleteProduct(p.id, p.image_url)}
                                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Eliminar permanentemente"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {products.length === 0 && !loading && (
                        <div className="p-12 text-center text-gray-500">
                            No hay productos registrados en la base de datos.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
