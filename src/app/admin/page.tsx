'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    Trash2, Plus, RefreshCw, LogOut, LayoutDashboard,
    ShoppingBag, Search, ChevronRight, TrendingUp, Package, Users, MapPin,
    AlertTriangle, Award, Calendar, ExternalLink, UserCheck, Check, X, XCircle, CreditCard
} from 'lucide-react'
import Logo from '../components/Logo'

export default function AdminDashboard() {
    const [view, setView] = useState<'inventory' | 'reports' | 'clients' | 'orders'>('inventory')
    const [products, setProducts] = useState<any[]>([])
    const [sales, setSales] = useState<any[]>([])
    const [onlineOrders, setOnlineOrders] = useState<any[]>([])
    const [clients, setClients] = useState<any[]>([])
    const [topSoldProducts, setTopSoldProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [stockPrompt, setStockPrompt] = useState<{ branchId: string; productId: string; newValue: number; productTitle: string; currentValue: number } | null>(null)
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false)
    const [newClientData, setNewClientData] = useState({ email: '', password: '', name: '', phone: '' })
    const [isAddingClient, setIsAddingClient] = useState(false)
    const router = useRouter()

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 4000)
    }

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
            const [prodRes, salesRes, profilesRes, itemsRes, onlineOrdersRes] = await Promise.all([
                supabase.from('products').select('*, product_branches(*)'),
                supabase.from('sales').select('*').order('created_at', { ascending: false }),
                supabase.from('profiles').select('*'),
                supabase.from('sale_items').select('*, products(title, image_url)'),
                supabase.from('online_orders').select('*, profiles(full_name, email), online_order_items(*, products(title))').order('created_at', { ascending: false })
            ])

            if (!isMounted) return

            if (prodRes.data) setProducts(prodRes.data)
            if (salesRes.data) setSales(salesRes.data)
            if (profilesRes.data) setClients(profilesRes.data)
            if (onlineOrdersRes.data) setOnlineOrders(onlineOrdersRes.data)

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

    const confirmStockUpdate = (branchId: string, productId: string, newValue: number, productTitle: string, currentValue: number) => {
        if (newValue !== currentValue && newValue >= 0) {
            setStockPrompt({ branchId, productId, newValue, productTitle, currentValue })
        }
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

        const { error } = await supabase
            .from('product_branches')
            .upsert({ product_id: productId, branch_id: branchId, stock: newStock }, { onConflict: 'product_id, branch_id' })

        if (error) {
            console.error('Error saving stock:', error.message)
            showNotification('Error al guardar en la base de datos', 'error')
            // Option to revert UI could go here, but fetchProducts would also fix it eventually.
        } else {
            showNotification(`Stock guardado: ${newStock} en ${branchId}`, 'success')
        }
    }

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('online_orders')
            .update({ status: newStatus })
            .eq('id', orderId)

        if (error) {
            showNotification('Error al actualizar pedido', 'error')
        } else {
            showNotification(`Pedido ${newStatus} exitosamente`, 'success')
            fetchDashboardData()
        }
    }

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isAddingClient) return
        setIsAddingClient(true)

        try {
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newClientData)
            })

            const data = await res.json()

            if (!res.ok) {
                showNotification(data.error || 'Error al crear cliente', 'error')
            } else {
                showNotification('Cliente registrado exitosamente', 'success')
                setIsAddClientModalOpen(false)
                setNewClientData({ email: '', password: '', name: '', phone: '' })
                // Refresh clients list
                const { data: updatedClients } = await supabase.from('profiles').select('*')
                if (updatedClients) setClients(updatedClients)
            }
        } catch (err: any) {
            showNotification('Error de conexión', 'error')
        } finally {
            setIsAddingClient(false)
        }
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
                    <button
                        onClick={() => setView('orders')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all font-medium ${view === 'orders'
                            ? 'bg-rose-600/10 text-rose-500 border-rose-500/10'
                            : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Package className="w-5 h-5" /> Pedidos Online
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
                                                                    onClick={() => confirmStockUpdate(branchId, p.id, getStock(branchId) - 1, p.title, getStock(branchId))}
                                                                    className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-rose-600 hover:text-white transition-all text-slate-400 font-black text-lg"
                                                                >-</button>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    defaultValue={getStock(branchId)}
                                                                    onBlur={(e) => {
                                                                        const val = parseInt(e.target.value);
                                                                        if (!isNaN(val)) {
                                                                            confirmStockUpdate(branchId, p.id, val, p.title, getStock(branchId));
                                                                        }
                                                                        e.target.value = getStock(branchId).toString(); // Reset until confirmed, optimistic UI will update defaultValue
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.currentTarget.blur();
                                                                        }
                                                                    }}
                                                                    className={`w-12 text-center text-sm font-black bg-transparent border-none outline-none ${getStock(branchId) > 0 ? 'text-white' : 'text-rose-500 opacity-70'} hide-arrows`}
                                                                />
                                                                <button
                                                                    onClick={() => confirmStockUpdate(branchId, p.id, getStock(branchId) + 1, p.title, getStock(branchId))}
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

                {view === 'orders' && (
                    <div className="space-y-12 animate-reveal">
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-1">
                                <h1 className="text-4xl font-black text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">Pedidos Online</h1>
                                <p className="text-slate-500 font-medium">Validación de pagos y control de despacho.</p>
                            </div>
                        </header>

                        <div className="glass rounded-[3rem] border-white/5 shadow-2xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="bg-slate-950/50 border-b border-white/5">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Orden / Fecha</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Cliente</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Monto</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Pago / Entrega</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Ticket</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Estado</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {onlineOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-black text-sm uppercase tracking-tighter cursor-help" title={order.id}>#{order.id.split('-')[0]}</span>
                                                    <span className="text-slate-500 text-[10px] font-bold">{new Date(order.created_at).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-sm">{order.profiles?.full_name || 'Desconocido'}</span>
                                                    <span className="text-slate-500 text-[10px]">{order.profiles?.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-white font-black text-lg tracking-tighter">${order.total.toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="w-3 h-3 text-blue-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{order.payment_method}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Package className="w-3 h-3 text-rose-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{order.delivery_method}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                {order.receipt_url ? (
                                                    <a href={order.receipt_url} target="_blank" className="inline-flex w-10 h-10 bg-blue-600/20 text-blue-500 rounded-xl items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                                                        <ExternalLink className="w-5 h-5" />
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-600 text-xs italic">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-tighter inline-block ${order.status === 'payment_approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                    order.status === 'payment_rejected' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                                        'bg-slate-900 border-white/10 text-slate-400'
                                                    }`}>
                                                    {order.status === 'pending_verification' ? 'En Verificación' :
                                                        order.status === 'payment_approved' ? 'Pago Aprobado' :
                                                            order.status === 'payment_rejected' ? 'Pago Rechazado' : order.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {order.status === 'pending_verification' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateOrderStatus(order.id, 'payment_approved')}
                                                                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                                                            >
                                                                <Check className="w-4 h-4" /> Aprobar
                                                            </button>
                                                            <button
                                                                onClick={() => updateOrderStatus(order.id, 'payment_rejected')}
                                                                className="h-10 px-4 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl font-bold text-xs border border-rose-500/20 transition-all flex items-center gap-2"
                                                            >
                                                                <XCircle className="w-4 h-4" /> Rechazar
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {onlineOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center text-slate-600 font-medium italic">
                                                No hay pedidos online registrados aún.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsAddClientModalOpen(true)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Nuevo Cliente
                                </button>
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

            {/* Stock Confirmation Modal */}
            {stockPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setStockPrompt(null)}></div>
                    <div className="bg-[#0f172a] border border-white/10 p-8 rounded-[2rem] shadow-2xl z-10 max-w-sm w-full animate-reveal relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500"></div>
                        <h3 className="text-xl font-black text-white mb-2">Confirmar Actualización</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            ¿Deseas confirmar este cambio de inventario para <span className="font-bold text-white tracking-tight">{stockPrompt.productTitle}</span> en la sucursal <span className="font-bold text-rose-400 capitalize">{stockPrompt.branchId}</span>?
                        </p>

                        <div className="flex items-center justify-center gap-6 mb-8 bg-black/20 py-4 rounded-2xl border border-white/5">
                            <div className="text-center">
                                <span className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Actual</span>
                                <span className="text-2xl font-black text-slate-400">{stockPrompt.currentValue}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                            <div className="text-center">
                                <span className="block text-[10px] uppercase font-black tracking-widest text-emerald-500 mb-1">Nuevo</span>
                                <span className="text-2xl font-black text-white px-3 py-1 bg-emerald-500/10 rounded-xl border border-emerald-500/20">{stockPrompt.newValue}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStockPrompt(null)}
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-300 hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    updateStockDirect(stockPrompt.branchId, stockPrompt.productId, stockPrompt.newValue)
                                    setStockPrompt(null)
                                }}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-black transition-colors shadow-lg shadow-emerald-600/20"
                            >
                                <Check className="w-4 h-4" /> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Client Modal */}
            {isAddClientModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddClientModalOpen(false)}></div>
                    <form onSubmit={handleCreateClient} className="bg-[#0f172a] border border-white/10 p-8 rounded-[2rem] shadow-2xl z-10 max-w-sm w-full animate-reveal relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500"></div>
                        <h3 className="text-xl font-black text-white mb-2">Registrar Cliente</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            Crea una cuenta para tu cliente para fidelizarlo y sumarle puntos.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={newClientData.name}
                                    onChange={e => setNewClientData({ ...newClientData, name: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    placeholder="Ej. María López"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    value={newClientData.email}
                                    onChange={e => setNewClientData({ ...newClientData, email: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    placeholder="Ej. maria@ejemplo.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Contraseña (Provisional)</label>
                                <input
                                    type="text"
                                    required
                                    minLength={6}
                                    value={newClientData.password}
                                    onChange={e => setNewClientData({ ...newClientData, password: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    placeholder="Al menos 6 caracteres"
                                />
                                <p className="text-[10px] text-slate-500 mt-2">Dile al cliente que inicie sesión con esta contraseña y podrá cambiarla después.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsAddClientModalOpen(false)}
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-300 hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isAddingClient}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-black transition-colors shadow-lg shadow-emerald-600/20"
                            >
                                {isAddingClient ? 'Creando...' : 'Crear Cuenta'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Global Notification Toast */}
            {notification && (
                <div className={`fixed bottom-8 right-8 z-[60] px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl animate-reveal border backdrop-blur-md ${notification.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-950/80 border-rose-500/30 text-rose-400'
                    }`}>
                    {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span className="font-bold">{notification.message}</span>
                </div>
            )}
        </div>
    )
}
