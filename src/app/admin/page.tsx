'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    Trash2, Plus, RefreshCw, LogOut, LayoutDashboard,
    ShoppingBag, Search, ChevronRight, TrendingUp, Package, Users, MapPin,
    AlertTriangle, Award, Calendar, ExternalLink, UserCheck
} from 'lucide-react'
import Logo from '../components/Logo'

export default function AdminDashboard() {
    const [view, setView] = useState<'inventory' | 'reports' | 'clients'>('inventory')
    const [products, setProducts] = useState<any[]>([])
    const [sales, setSales] = useState<any[]>([])
    const [clients, setClients] = useState<any[]>([])
    const [topSoldProducts, setTopSoldProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*, product_branches(*)')
            .order('created_at', { ascending: false })

        if (data) setProducts(data)
    }

    const fetchDashboardData = async () => {
        if (!isMounted) return
        setLoading(true)

        try {
            // Fetch All Necessary Data
            const [prodRes, salesRes, profilesRes, itemsRes] = await Promise.all([
                supabase.from('products').select('*, product_branches(*)'),
                supabase.from('sales').select('*').order('created_at', { ascending: false }),
                supabase.from('profiles').select('*'),
                supabase.from('sale_items').select('*, products(title, image_url)')
            ])

            if (!isMounted) return

            if (prodRes.data) setProducts(prodRes.data)
            if (salesRes.data) setSales(salesRes.data)
            if (profilesRes.data) setClients(profilesRes.data)

            // Calculate Top Products
            if (itemsRes.data) {
                const productSales: Record<string, { title: string, image: string, qty: number, total: number }> = {}
                itemsRes.data.forEach((item: any) => {
                    if (!productSales[item.product_id]) {
                        productSales[item.product_id] = {
                            title: item.products?.title || 'Producto Eliminado',
                            image: item.products?.image_url || '',
                            qty: 0,
                            total: 0
                        }
                    }
                    productSales[item.product_id].qty += item.quantity
                    productSales[item.product_id].total += item.quantity * item.price_at_time
                })
                const sorted = Object.entries(productSales)
                    .map(([id, stats]) => ({ id, ...stats }))
                    .sort((a, b) => b.qty - a.qty)
                    .slice(0, 5)
                setTopSoldProducts(sorted)
            }
        } finally {
            if (isMounted) setLoading(false)
        }
    }

    const [isMounted, setIsMounted] = useState(true)

    useEffect(() => {
        setIsMounted(true)
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!isMounted) return

            if (!user) {
                router.push('/login')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!isMounted) return

            if (profile?.role === 'admin' || profile?.role === 'cajero') {
                setRole(profile.role)
                fetchDashboardData()
            } else {
                router.push('/login')
            }
        }
        checkAuth()
        return () => setIsMounted(false)
    }, [])

    const deleteProduct = async (id: string, imageUrl: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto y todo su stock?')) return

        try {
            const fileName = imageUrl.split('/').pop()
            if (fileName) {
                await supabase.storage.from('products').remove([fileName])
            }
        } catch (e) { }

        await supabase.from('products').delete().eq('id', id)
        fetchProducts()
    }

    const updateStockDirect = async (branchId: string, productId: string, newValue: number) => {
        const newStock = Math.max(0, newValue)
        // Optimistic UI update
        setProducts(products.map(p => {
            if (p.id === productId) {
                const updatedBranches = p.product_branches ? [...p.product_branches] : []
                const bIdx = updatedBranches.findIndex(b => b.branch_id === branchId)
                if (bIdx >= 0) {
                    updatedBranches[bIdx].stock = newStock
                } else {
                    updatedBranches.push({ branch_id: branchId, stock: newStock, product_id: productId } as any)
                }
                return { ...p, product_branches: updatedBranches }
            }
            return p
        }))

        await supabase
            .from('product_branches')
            .upsert({ product_id: productId, branch_id: branchId, stock: newStock, updated_at: new Date().toISOString() }, { onConflict: 'product_id, branch_id' })
    }

    const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-950 border-r border-white/5 flex flex-col p-6 shrink-0">
                <div className="mb-12">
                    <Logo scale={0.65} />
                </div>

                <nav className="flex-1 space-y-2">
                    <button
                        onClick={() => setView('inventory')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all font-bold ${view === 'inventory'
                            ? 'bg-rose-600/10 text-rose-500 border-rose-500/10'
                            : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </button>
                    <button onClick={() => router.push('/pos')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent rounded-2xl transition-all font-medium group">
                        <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" /> Punto de Venta
                    </button>
                    <button
                        onClick={() => setView('reports')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all font-medium ${view === 'reports'
                            ? 'bg-rose-600/10 text-rose-500 border-rose-500/10'
                            : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <TrendingUp className="w-5 h-5" /> Reportes
                    </button>
                    <button
                        onClick={() => setView('clients')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all font-medium ${view === 'clients'
                            ? 'bg-rose-600/10 text-rose-500 border-rose-500/10'
                            : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Users className="w-5 h-5" /> Clientes
                    </button>
                </nav>

                <div className="pt-6 border-t border-white/5">
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut()
                            router.push('/login')
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all font-bold"
                    >
                        <LogOut className="w-5 h-5" /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 p-10 overflow-y-auto">
                {view === 'inventory' && (
                    <>
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                            <div className="space-y-1">
                                <h1 className="text-4xl font-black text-white tracking-tight">Inventario Global</h1>
                                <p className="text-slate-500 font-medium">Control centralizado de stock para tus tres sucursales.</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="relative group min-w-[300px]">
                                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Filtrar productos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-rose-500/30 transition-all font-medium"
                                    />
                                </div>
                                <button
                                    onClick={fetchProducts}
                                    className="p-3 bg-slate-900 border border-white/5 rounded-2xl hover:bg-slate-800 transition-colors"
                                >
                                    <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                {role === 'admin' && (
                                    <button className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-rose-600/20 transition-all active:scale-95 flex items-center gap-2">
                                        <Plus className="w-5 h-5" /> Nuevo
                                    </button>
                                )}
                            </div>
                        </header>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="glass p-8 rounded-[2rem] space-y-3">
                                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                    <Package className="w-6 h-6 text-blue-500" />
                                </div>
                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Productos Total</p>
                                <p className="text-4xl font-black text-white">{products.length}</p>
                            </div>
                            <div className="glass p-8 rounded-[2rem] space-y-3">
                                <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                                </div>
                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">En Stock Global</p>
                                <p className="text-4xl font-black text-white">
                                    {products.reduce((acc, p) => acc + (p.product_branches?.reduce((bAcc: number, b: any) => bAcc + b.stock, 0) || 0), 0)}
                                </p>
                            </div>
                            <div className="glass p-8 rounded-[2rem] space-y-3">
                                <div className="w-12 h-12 bg-rose-600/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
                                    <MapPin className="w-6 h-6 text-rose-500" />
                                </div>
                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Sucursales Activas</p>
                                <p className="text-4xl font-black text-white">3</p>
                            </div>
                        </div>

                        {/* Products Table */}
                        <div className="glass rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl animate-reveal">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                            <th className="p-6">Información de Producto</th>
                                            <th className="p-6">Precio</th>
                                            <th className="p-6 text-center">Simón Bolívar</th>
                                            <th className="p-6 text-center">Floresta</th>
                                            <th className="p-6 text-center">Pantitlán</th>
                                            <th className="p-6 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredProducts.map((p) => {
                                            const getStock = (branch: string) => {
                                                const b = p.product_branches?.find((pb: any) => pb.branch_id === branch)
                                                return b ? b.stock : 0
                                            }

                                            return (
                                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-5">
                                                            <div className="relative w-16 h-20 rounded-[1.25rem] overflow-hidden border border-white/5 group-hover:border-white/10 transition-all shrink-0 bg-white">
                                                                <Image src={p.image_url} alt={p.title} fill className="object-contain p-2" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="font-bold text-white text-base leading-tight max-w-[280px]">{p.title}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20">IA Optimized</span>
                                                                    <span className="text-[9px] font-medium text-slate-500">ID: {p.id.substring(0, 6)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <p className="text-xl font-black text-rose-500 leading-none">${p.price}</p>
                                                    </td>

                                                    {/* Stock Branches */}
                                                    {['simon', 'floresta', 'pantitlan'].map((branchId) => (
                                                        <td key={branchId} className="p-6">
                                                            <div className="flex items-center justify-center gap-2 bg-black/20 rounded-2xl py-1.5 px-3 border border-white/5 w-max mx-auto">
                                                                <button
                                                                    onClick={() => updateStockDirect(branchId, p.id, getStock(branchId) - 1)}
                                                                    className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-rose-600 hover:text-white transition-all text-slate-400 font-black text-lg"
                                                                >-</button>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    defaultValue={getStock(branchId)}
                                                                    onBlur={(e) => {
                                                                        const val = parseInt(e.target.value);
                                                                        if (!isNaN(val) && val !== getStock(branchId)) {
                                                                            updateStockDirect(branchId, p.id, val);
                                                                        } else {
                                                                            e.target.value = getStock(branchId).toString();
                                                                        }
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.currentTarget.blur();
                                                                        }
                                                                    }}
                                                                    className={`w-12 text-center text-sm font-black bg-transparent border-none outline-none ${getStock(branchId) > 0 ? 'text-white' : 'text-rose-500 opacity-70'} hide-arrows`}
                                                                />
                                                                <button
                                                                    onClick={() => updateStockDirect(branchId, p.id, getStock(branchId) + 1)}
                                                                    className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-emerald-600 hover:text-white transition-all text-slate-400 font-black text-lg"
                                                                >+</button>
                                                            </div>
                                                        </td>
                                                    ))}

                                                    <td className="p-6 text-right">
                                                        {role === 'admin' && (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                                                    <ChevronRight className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteProduct(p.id, p.image_url)}
                                                                    className="p-3 text-slate-500 hover:text-rose-600 hover:bg-rose-600/10 rounded-xl transition-all"
                                                                    title="Eliminar permanentemente"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                {products.length === 0 && !loading && (
                                    <div className="p-24 text-center space-y-4 opacity-30">
                                        <Package className="w-20 h-20 mx-auto" />
                                        <p className="font-bold uppercase tracking-[0.2em] text-xs">Sin registros</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {view === 'reports' && (
                    <div className="space-y-12 animate-reveal">
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-1">
                                <h1 className="text-4xl font-black text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">Inteligencia de Negocio</h1>
                                <p className="text-slate-500 font-medium whitespace-pre">Analítica de ventas y control preventivo de inventario.</p>
                            </div>
                            <button onClick={fetchDashboardData} className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all font-bold">
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar Datos
                            </button>
                        </header>

                        {/* Top Section: Sales and Alerts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Branch Sales Performance */}
                            <div className="glass p-8 rounded-[2.5rem] space-y-8 border-white/5 shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                                        <Calendar className="w-6 h-6 text-rose-500" /> Ventas por Sucursal (Hoy)
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">En Vivo</span>
                                </div>
                                <div className="space-y-6">
                                    {['simon', 'floresta', 'pantitlan'].map(bId => {
                                        const branchSales = sales.filter(s => s.branch_id === bId && new Date(s.created_at).toDateString() === new Date().toDateString())
                                        const total = branchSales.reduce((acc, s) => acc + s.total, 0)
                                        const maxPossible = 10000 // Just for the progress bar visual
                                        const percentage = Math.min((total / maxPossible) * 100, 100)

                                        return (
                                            <div key={bId} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{bId === 'simon' ? 'Simón Bolívar' : bId.charAt(0).toUpperCase() + bId.slice(1)}</p>
                                                        <p className="text-2xl font-black text-white">${total.toLocaleString()}</p>
                                                    </div>
                                                    <p className="text-slate-500 text-xs font-bold">{branchSales.length} ventas</p>
                                                </div>
                                                <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-[2px]">
                                                    <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Low Stock Alerts */}
                            <div className="glass p-8 rounded-[2.5rem] space-y-8 border-white/5 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                    <AlertTriangle className="w-32 h-32 text-rose-500 rotate-12" />
                                </div>
                                <h3 className="text-xl font-black text-white flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6 text-amber-500" /> Alerta de Bajo Stock
                                </h3>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {products.filter(p => p.product_branches?.some((b: any) => b.stock < 5)).map(p => (
                                        <div key={p.id} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group">
                                            <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-white shrink-0">
                                                <Image src={p.image_url} alt={p.title} fill className="object-contain p-1" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-white text-sm truncate">{p.title}</p>
                                                <div className="flex gap-2 mt-1">
                                                    {p.product_branches?.filter((b: any) => b.stock < 5).map((b: any) => (
                                                        <span key={b.branch_id} className="text-[8px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded bg-rose-600/20 border border-rose-500/30">
                                                            {b.branch_id}: {b.stock}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <AlertTriangle className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                    {products.every(p => p.product_branches?.every((b: any) => b.stock >= 5)) && (
                                        <div className="h-40 flex flex-col items-center justify-center text-slate-600 space-y-3">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                                                <UserCheck className="w-6 h-6" />
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-widest">Stock Saludable</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Selling Products */}
                        <div className="glass p-10 rounded-[3rem] border-white/5 shadow-2xl overflow-hidden relative">
                            <h3 className="text-xl font-black text-white flex items-center gap-3 mb-10">
                                <Award className="w-6 h-6 text-yellow-500" /> Prendas más Vendidas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                                {topSoldProducts.map((p, i) => (
                                    <div key={p.id} className="relative group perspective-1000">
                                        <div className="space-y-4 text-center">
                                            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-white/5 transition-transform duration-500 group-hover:scale-105 shadow-xl bg-white">
                                                <div className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-slate-950 text-white font-black flex items-center justify-center text-xs border border-white/10 shadow-2xl">
                                                    #{i + 1}
                                                </div>
                                                <Image src={p.image} alt={p.title} fill className="object-contain p-4" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity"></div>
                                            </div>
                                            <div className="space-y-1 px-2">
                                                <p className="font-bold text-white text-sm line-clamp-1">{p.title}</p>
                                                <p className="text-rose-500 font-black text-xs uppercase tracking-tighter">{p.qty} Unidades</p>
                                                <p className="text-slate-500 text-[10px] font-medium">${p.total.toLocaleString()} totales</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {topSoldProducts.length === 0 && (
                                    <div className="col-span-5 py-20 text-center text-slate-600 italic">
                                        Esperando por las primeras ventas del día...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'clients' && (
                    <div className="space-y-12 animate-reveal">
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-1">
                                <h1 className="text-4xl font-black text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">Gestión de Audiencia</h1>
                                <p className="text-slate-500 font-medium whitespace-pre">Segmentación de clientes y monitoreo de lealtad.</p>
                            </div>
                        </header>

                        {/* Customer Segments Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass p-8 rounded-[2.5rem] flex items-center gap-8 border-white/5 shadow-2xl">
                                <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center border border-blue-500/20 shadow-2xl">
                                    <ExternalLink className="w-8 h-8 text-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest">En Línea (Web)</p>
                                    <p className="text-4xl font-black text-white">{clients.filter(c => c.role === 'cliente').length}</p>
                                    <p className="text-[10px] font-bold text-blue-400">Usuarios Registrados</p>
                                </div>
                            </div>
                            <div className="glass p-8 rounded-[2.5rem] flex items-center gap-8 border-white/5 shadow-2xl relative overflow-hidden group">
                                <div className="w-16 h-16 bg-teal-600/10 rounded-3xl flex items-center justify-center border border-teal-500/20 shadow-2xl">
                                    <ShoppingBag className="w-8 h-8 text-teal-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest">En Piso (Sucursal)</p>
                                    <p className="text-4xl font-black text-white">{new Set(sales.map(s => s.user_id)).size}</p>
                                    <p className="text-[10px] font-bold text-teal-400">Interacción POS Hoy</p>
                                </div>
                            </div>
                        </div>

                        {/* Client List with Loyalty Metrics */}
                        <div className="glass rounded-[3rem] overflow-hidden border-white/5 shadow-2xl relative">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
                                <h3 className="text-xl font-black text-white flex items-center gap-3">
                                    <UserCheck className="w-6 h-6 text-emerald-500" /> Perfiles de Cliente (Programa de Lealtad)
                                </h3>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[10px] font-bold border border-rose-500/20">SILVER CAP</span>
                                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-bold border border-yellow-500/20">GOLD KEY</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5 bg-slate-950/40">
                                            <th className="p-8">Información Personal</th>
                                            <th className="p-8">Origen</th>
                                            <th className="p-8">Nivel Lealtad</th>
                                            <th className="p-8 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {clients.filter(c => c.role === 'cliente').length > 0 ? (
                                            clients.filter(c => c.role === 'cliente').map(client => (
                                                <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="p-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center font-black text-slate-400 border border-white/10 group-hover:border-rose-500/50 transition-all">
                                                                {client.email?.charAt(0).toUpperCase() || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-white text-base">{client.email?.split('@')[0] || 'Cliente Sin Nombre'}</p>
                                                                <p className="text-slate-500 text-xs font-medium">{client.email || 'Sin contacto registrado'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-8 px-12">
                                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase border border-blue-500/20">
                                                            Web Platform
                                                        </span>
                                                    </td>
                                                    <td className="p-8 px-12">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-32 h-2 bg-slate-900 rounded-full border border-white/5 overflow-hidden">
                                                                <div className="h-full bg-rose-600 rounded-full w-[15%]"></div>
                                                            </div>
                                                            <span className="text-[10px] font-black text-rose-500">12 pts</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-8 text-right">
                                                        <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl border border-white/5 hover:border-rose-500/50 transition-all">
                                                            Ver Perfil
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="p-20 text-center">
                                                    <div className="flex flex-col items-center gap-4 opacity-30">
                                                        <Users className="w-16 h-16" />
                                                        <p className="font-black uppercase tracking-widest text-xs">Sin clientes registrados para fidelizar</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
