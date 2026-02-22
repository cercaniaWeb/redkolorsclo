'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
    Search, ShoppingCart, Minus, Plus, Trash2, Printer, XCircle, Facebook,
    MapPin, Store, CreditCard, Wallet, DollarSign, Package,
    ChevronRight, RefreshCcw, Bell, User
} from 'lucide-react'
import Logo from '../components/Logo'

export default function POSPage() {
    const [products, setProducts] = useState<any[]>([])
    const [cart, setCart] = useState<any[]>([])
    const [branch, setBranch] = useState<string>('simon')
    const [searchTerm, setSearchTerm] = useState('')
    const [userRole, setUserRole] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [todaySales, setTodaySales] = useState(0)

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isLive, setIsLive] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta'>('efectivo')
    const [amountTendered, setAmountTendered] = useState<number | ''>('')

    // Cash Closeout State
    const [isCloseoutModalOpen, setIsCloseoutModalOpen] = useState(false)
    const [closeoutSummary, setCloseoutSummary] = useState<{ cash: number, card: number, count: number } | null>(null)

    const router = useRouter()

    const branchMap: Record<string, string> = {
        simon: 'Simón Bolívar',
        floresta: 'Floresta',
        pantitlan: 'Pantitlán'
    }

    useEffect(() => {
        checkAuthAndFetch()
    }, [branch])

    const checkAuthAndFetch = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }
        setUserId(user.id)

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'admin' && profile?.role !== 'cajero') {
            router.push('/login')
            return
        }
        setUserRole(profile.role)

        await fetchProducts()
        await fetchTodaySales()
        setLoading(false)
    }

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*, product_branches(*)')
            .order('created_at', { ascending: false })
        if (data) setProducts(data)
    }

    const fetchTodaySales = async () => {
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const { data } = await supabase
            .from('sales')
            .select('total')
            .eq('branch_id', branch)
            .gte('created_at', startOfDay.toISOString())

        if (data) {
            const sum = data.reduce((acc: number, curr: any) => acc + Number(curr.total), 0)
            setTodaySales(sum)
        }
    }

    const openCloseout = async () => {
        setLoading(true)
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const { data } = await supabase
            .from('sales')
            .select('*')
            .eq('branch_id', branch)
            .gte('created_at', startOfDay.toISOString())

        if (data) {
            const summary = data.reduce((acc: any, curr: any) => {
                if (curr.payment_method === 'efectivo') acc.cash += Number(curr.total)
                if (curr.payment_method === 'tarjeta') acc.card += Number(curr.total)
                acc.count += 1
                return acc
            }, { cash: 0, card: 0, count: 0 })
            setCloseoutSummary(summary)
            setIsCloseoutModalOpen(true)
        }
        setLoading(false)
    }

    const addToCart = (product: any) => {
        const branchStock = product.product_branches?.find((b: any) => b.branch_id === branch)?.stock || 0
        if (branchStock <= 0) return

        const existing = cart.find(i => i.id === product.id)
        if (existing) {
            if (existing.cartQuantity >= branchStock) return
            setCart(cart.map(i => i.id === product.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i))
        } else {
            setCart([...cart, { ...product, cartQuantity: 1 }])
        }
    }

    const updateCartQuantity = (id: string, newQ: number) => {
        if (newQ <= 0) {
            setCart(cart.filter(i => i.id !== id))
            return
        }
        const prod = cart.find(i => i.id === id)
        const maxStock = prod.product_branches?.find((b: any) => b.branch_id === branch)?.stock || 0
        if (newQ > maxStock) return
        setCart(cart.map(i => i.id === id ? { ...i, cartQuantity: newQ } : i))
    }

    const totalCart = cart.reduce((acc, item) => acc + (item.price * item.cartQuantity), 0)

    const openPaymentModal = () => {
        if (cart.length === 0) return
        setPaymentMethod('efectivo')
        setAmountTendered('')
        setIsPaymentModalOpen(true)
    }

    const confirmPayment = async () => {
        if (paymentMethod === 'efectivo' && Number(amountTendered) < totalCart) return
        const finalPaymentMethod = isLive ? `live-${paymentMethod}` : paymentMethod
        setLoading(true)

        const { data: saleData, error: saleError } = await supabase
            .from('sales')
            .insert({ branch_id: branch, user_id: userId, total: totalCart, payment_method: finalPaymentMethod })
            .select()
            .single()

        if (saleError) {
            setLoading(false)
            return
        }

        for (const item of cart) {
            await supabase.from('sale_items').insert({
                sale_id: saleData.id,
                product_id: item.id,
                quantity: item.cartQuantity,
                price_at_time: item.price
            })
            const currentStock = item.product_branches?.find((b: any) => b.branch_id === branch)?.stock || 0
            const newStock = Math.max(0, currentStock - item.cartQuantity)
            await supabase
                .from('product_branches')
                .update({ stock: newStock })
                .match({ product_id: item.id, branch_id: branch })
        }

        window.print()
        setCart([])
        setIsPaymentModalOpen(false)
        await fetchProducts()
        await fetchTodaySales()
        setLoading(false)
    }

    const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans selection:bg-rose-500/30">
            {/* Sidebar Navigation */}
            <aside className="w-20 bg-slate-950 border-r border-white/5 flex flex-col items-center py-8 gap-10 shrink-0 print:hidden">
                <div className="flex flex-col items-center">
                    <Logo scale={0.35} className="-mt-2" />
                </div>
                <nav className="flex flex-col gap-6">
                    <button className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20"><Store className="w-6 h-6" /></button>
                    <button onClick={() => router.push('/admin')} className="p-3 text-slate-500 hover:text-white transition-colors"><Package className="w-6 h-6" /></button>
                    <button className="p-3 text-slate-500 hover:text-white transition-colors"><Bell className="w-6 h-6" /></button>
                </nav>
                <div className="mt-auto flex flex-col gap-6 items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                        <User className="w-5 h-5 text-slate-400" />
                    </div>
                </div>
            </aside>

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-white/5 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0 print:hidden">
                    <div className="flex items-center gap-6">
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-white uppercase">Checkout <span className="text-rose-500">System</span></h1>
                            <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">{branchMap[branch]}</p>
                        </div>
                        <div className="h-8 w-px bg-white/5"></div>
                        <div className="relative">
                            <select
                                value={branch}
                                onChange={(e) => setBranch(e.target.value)}
                                className="appearance-none bg-slate-900/50 border border-white/5 text-xs font-bold uppercase tracking-wider text-slate-300 rounded-xl pl-4 pr-10 py-2.5 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all cursor-pointer hover:bg-slate-800"
                            >
                                <option value="simon">Sucursal Simón Bolívar</option>
                                <option value="floresta">Sucursal Floresta</option>
                                <option value="pantitlan">Sucursal Pantitlán</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronRight className="w-4 h-4 text-slate-500 rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 bg-slate-950 px-5 py-2.5 rounded-2xl border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Caja hoy</span>
                                <span className="text-sm font-black text-emerald-400 leading-none">${todaySales.toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${isLive ? 'bg-rose-600 border-rose-400 text-white animate-pulse' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                        >
                            <Facebook className={`w-4 h-4 ${isLive ? 'text-white' : 'text-slate-500'}`} />
                            {isLive ? 'Modo Live Activo' : 'Activar Modo Live'}
                        </button>

                        <button
                            onClick={openCloseout}
                            className="bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            <DollarSign className="w-4 h-4" />
                            Corte de Caja
                        </button>
                        <button
                            onClick={fetchProducts}
                            className="p-3 bg-slate-900 border border-white/5 rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                        >
                            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex overflow-hidden">
                    {/* Catalog Section */}
                    <div className="flex-1 flex flex-col bg-slate-950/20 px-8 py-6 gap-6">
                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900/40 border border-white/5 rounded-[1.25rem] pl-12 pr-6 py-4 text-base font-medium placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 focus:bg-slate-900 transition-all shadow-inner"
                            />
                        </div>

                        {/* Product Grid */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {filteredProducts.map(p => {
                                    const localStock = p.product_branches?.find((b: any) => b.branch_id === branch)?.stock || 0
                                    const isOut = localStock === 0

                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => !isOut && addToCart(p)}
                                            className={`group relative glass rounded-[2rem] overflow-hidden transition-all duration-300 flex flex-col ${isOut ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-[1.02] hover:border-rose-500/20 cursor-pointer shadow-xl hover:shadow-rose-600/5'}`}
                                        >
                                            <div className="relative aspect-[4/5] w-full bg-white overflow-hidden">
                                                <Image src={p.image_url} alt={p.title} fill className="object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                                                {isOut && (
                                                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                                                        <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest">Agotado</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col gap-3">
                                                <h4 className="text-sm font-bold text-slate-100 line-clamp-2 leading-tight">{p.title}</h4>
                                                <div className="flex justify-between items-end mt-auto">
                                                    <p className="text-lg font-black text-rose-500">${p.price.toFixed(2)}</p>
                                                    <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 flex items-center gap-1.5">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${localStock > 5 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                        <span className="text-[10px] font-bold text-slate-400">{localStock}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Cart Section (Right) */}
                    <div className="w-[420px] bg-slate-950 border-l border-white/5 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-10 print:hidden">
                        <div className="p-8 border-b border-white/5 bg-slate-900/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-600/10 rounded-xl border border-rose-500/20">
                                    <ShoppingCart className="w-5 h-5 text-rose-500" />
                                </div>
                                <div>
                                    <h2 className="font-black text-white uppercase tracking-tighter text-lg">Carrito</h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{cart.length} artículos</p>
                                </div>
                            </div>
                            {cart.length > 0 && (
                                <button onClick={() => setCart([])} className="text-[10px] font-black uppercase text-slate-500 hover:text-rose-500 transition-colors">Limpiar</button>
                            )}
                        </div>

                        {/* Cart Items List */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-5 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                                    <ShoppingCart className="w-20 h-20" />
                                    <p className="font-bold uppercase tracking-widest text-xs">La caja está vacía</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex gap-4 p-4 bg-slate-900/40 border border-white/5 rounded-[1.5rem] group hover:border-white/10 transition-all">
                                        <div className="relative w-16 h-20 bg-white rounded-xl overflow-hidden shrink-0">
                                            <Image src={item.image_url} alt={item.title} fill className="object-contain p-1" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="flex justify-between gap-2">
                                                <span className="text-sm font-bold text-slate-200 line-clamp-1 truncate">{item.title}</span>
                                                <button onClick={() => updateCartQuantity(item.id, 0)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-500 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-3 bg-black/40 rounded-xl px-2 py-1 border border-white/5">
                                                    <button onClick={() => updateCartQuantity(item.id, item.cartQuantity - 1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-white transition-colors"><Minus className="w-3 h-3" /></button>
                                                    <span className="text-sm font-black text-white w-4 text-center">{item.cartQuantity}</span>
                                                    <button onClick={() => updateCartQuantity(item.id, item.cartQuantity + 1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-white transition-colors"><Plus className="w-3 h-3" /></button>
                                                </div>
                                                <span className="font-black text-rose-500">${(item.price * item.cartQuantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Order Summary & Pay */}
                        <div className="p-8 bg-slate-900/40 border-t border-white/5 space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-slate-500 px-1">
                                    <span className="text-xs font-bold uppercase tracking-widest">Base imponible</span>
                                    <span className="text-sm font-medium font-mono">${(totalCart * 0.84).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500 px-1">
                                    <span className="text-xs font-bold uppercase tracking-widest">IVA (16%)</span>
                                    <span className="text-sm font-medium font-mono">${(totalCart * 0.16).toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-white/5 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-white uppercase tracking-tighter">Total a pagar</span>
                                    <span className="text-4xl font-black text-white tracking-tighter">${totalCart.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={openPaymentModal}
                                disabled={cart.length === 0 || loading}
                                className={`w-full group py-5 rounded-[1.75rem] font-black text-xl flex items-center justify-center gap-3 transition-all ${cart.length === 0 ? 'bg-slate-800 text-slate-600 grayscale cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-900/40 active:scale-95'}`}
                            >
                                <Printer className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                Realizar Cobro
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* PAYMENT MODAL - Enhanced UI */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-reveal print:hidden">
                    <div className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-xl shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
                            <h2 className="text-2xl font-black text-white flex items-center gap-4">
                                <div className="w-10 h-10 bg-rose-600/20 rounded-xl flex items-center justify-center"><Wallet className="w-6 h-6 text-rose-500" /></div>
                                Finalizar Orden
                            </h2>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"><XCircle className="w-6 h-6" /></button>
                        </div>

                        <div className="p-10 space-y-10">
                            <div className="text-center space-y-2">
                                <p className="text-slate-500 text-xs font-black tracking-widest uppercase">Total de la Venta</p>
                                <p className="text-7xl font-black text-white tracking-tighter">${totalCart.toFixed(2)}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <button
                                    onClick={() => setPaymentMethod('efectivo')}
                                    className={`p-6 rounded-[2rem] flex flex-col items-center justify-center border-2 transition-all gap-3 ${paymentMethod === 'efectivo' ? 'bg-rose-600/10 border-rose-500 text-rose-500' : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/10'}`}
                                >
                                    <DollarSign className="w-10 h-10" />
                                    <span className="font-black uppercase tracking-widest text-xs">Efectivo</span>
                                </button>
                                <button
                                    onClick={() => { setPaymentMethod('tarjeta'); setAmountTendered(totalCart); }}
                                    className={`p-6 rounded-[2rem] flex flex-col items-center justify-center border-2 transition-all gap-3 ${paymentMethod === 'tarjeta' ? 'bg-rose-600/10 border-rose-500 text-rose-500' : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/10'}`}
                                >
                                    <CreditCard className="w-10 h-10" />
                                    <span className="font-black uppercase tracking-widest text-xs">Tarjeta</span>
                                </button>
                            </div>

                            {paymentMethod === 'efectivo' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Monto Recibido</label>
                                            {Number(amountTendered) > 0 && <span className="text-[10px] font-medium text-slate-600">Enter para cobrar</span>}
                                        </div>
                                        <input
                                            type="number"
                                            value={amountTendered}
                                            onChange={(e) => setAmountTendered(e.target.value ? Number(e.target.value) : '')}
                                            className="bg-slate-950 border border-white/10 text-white text-5xl rounded-[2rem] p-8 focus:ring-rose-500/50 focus:border-rose-500 outline-none text-center font-black tracking-tighter shadow-inner"
                                            placeholder="0.00"
                                            min={totalCart}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex justify-between items-center p-6 bg-black/40 border border-white/5 rounded-3xl">
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Cambio</span>
                                            <span className={`text-3xl font-black ${Number(amountTendered) >= totalCart ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                ${Math.max(0, Number(amountTendered) - totalCart).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center">
                                            <DollarSign className="w-6 h-6 text-slate-500" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-slate-950/50 border-t border-white/5">
                            <button
                                onClick={confirmPayment}
                                disabled={loading || (paymentMethod === 'efectivo' && Number(amountTendered) < totalCart)}
                                className="w-full py-6 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-2xl rounded-[2rem] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-rose-600/30 active:scale-95"
                            >
                                <Printer className="w-7 h-7" /> Completar Venta
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* CORTE DE CAJA MODAL */}
            {isCloseoutModalOpen && closeoutSummary && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-6 animate-reveal print:hidden">
                    <div className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
                            <h2 className="text-2xl font-black text-white flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center"><Printer className="w-6 h-6 text-emerald-500" /></div>
                                Resumen de Corte
                            </h2>
                            <button onClick={() => setIsCloseoutModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"><XCircle className="w-6 h-6" /></button>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="glass p-6 rounded-3xl space-y-2 border-white/5">
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Efectivo</p>
                                    <p className="text-3xl font-black text-emerald-400">${closeoutSummary.cash.toFixed(2)}</p>
                                </div>
                                <div className="glass p-6 rounded-3xl space-y-2 border-white/5">
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Tarjeta</p>
                                    <p className="text-3xl font-black text-blue-400">${closeoutSummary.card.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 text-center space-y-2">
                                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Total Vendido ({closeoutSummary.count} ventas)</p>
                                <p className="text-6xl font-black text-white tracking-tighter">${(closeoutSummary.cash + closeoutSummary.card).toFixed(2)}</p>
                            </div>

                            <button
                                onClick={() => window.print()}
                                className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-emerald-900/20"
                            >
                                <Printer className="w-6 h-6" /> Imprimir Corte
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PRINTABLE SECTION --- */}
            <div className="hidden print:block w-[80mm] text-black bg-white mx-auto font-mono text-[10pt] leading-tight p-4">
                {isCloseoutModalOpen && closeoutSummary ? (
                    /* Closeout Ticket */
                    <div className="text-center space-y-4">
                        <h2 className="font-black text-2xl tracking-tighter">CORTE DE CAJA</h2>
                        <p className="text-[8pt] uppercase font-bold tracking-widest">{branchMap[branch]}</p>
                        <div className="border-t-2 border-black my-4"></div>
                        <div className="space-y-2 text-left">
                            <div className="flex justify-between font-bold uppercase">
                                <span>Fecha:</span>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between font-bold uppercase">
                                <span>Hora:</span>
                                <span>{new Date().toLocaleTimeString()}</span>
                            </div>
                            <div className="flex justify-between font-bold uppercase">
                                <span>Ventas:</span>
                                <span>{closeoutSummary?.count || 0}</span>
                            </div>
                            <div className="border-t border-black border-dashed my-2"></div>
                            <div className="flex justify-between text-lg font-black">
                                <span>EFECTIVO:</span>
                                <span>${(closeoutSummary?.cash || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black">
                                <span>TARJETA:</span>
                                <span>${(closeoutSummary?.card || 0).toFixed(2)}</span>
                            </div>
                            <div className="border-t-2 border-black my-4"></div>
                            <div className="flex justify-between text-2xl font-black italic">
                                <span>TOTAL:</span>
                                <span>${((closeoutSummary?.cash || 0) + (closeoutSummary?.card || 0)).toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mt-12 space-y-8">
                            <div className="border-t border-black w-48 mx-auto"></div>
                            <p className="text-[8pt] uppercase font-bold">Firma del Cajero</p>
                        </div>
                    </div>
                ) : (
                    /* Standard Sales Ticket */
                    <>
                        <div className="text-center mb-6 space-y-1">
                            <h2 className="font-black text-2xl tracking-tighter">RED KOLORS</h2>
                            <p className="text-[8pt] uppercase font-bold tracking-widest">{branchMap[branch]}</p>
                            <div className="h-px bg-black w-full my-2"></div>
                            <p className="text-[7pt]">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                            <p className="text-[7pt]">Cajero: {userRole?.toUpperCase()}</p>
                        </div>

                        <div className="border-t border-black border-dashed my-3"></div>

                        <div className="space-y-3 mb-6">
                            {cart.map(item => (
                                <div key={item.id} className="flex flex-col">
                                    <p className="font-bold uppercase text-[9pt]">{item.title}</p>
                                    <div className="flex justify-between w-full text-[8pt]">
                                        <span>{item.cartQuantity} x ${item.price.toFixed(2)}</span>
                                        <span className="font-bold">${(item.cartQuantity * item.price).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t-2 border-black my-4"></div>

                        <div className="flex justify-between items-center font-black text-xl mb-4">
                            <span>TOTAL</span>
                            <span>${totalCart.toFixed(2)}</span>
                        </div>

                        <div className="space-y-1 text-[8pt] border-t border-black pt-4">
                            <div className="flex justify-between">
                                <span className="font-bold">METODO:</span>
                                <span>{paymentMethod.toUpperCase()}</span>
                            </div>
                            {paymentMethod === 'efectivo' && (
                                <>
                                    <div className="flex justify-between">
                                        <span>RECIBIDO:</span>
                                        <span>${Number(amountTendered).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span>CAMBIO:</span>
                                        <span>${(Number(amountTendered) - totalCart).toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="text-center mt-10 space-y-2">
                            <p className="font-bold text-[9pt]">¡GRACIAS POR TU COMPRA!</p>
                            <p className="text-[7pt] italic">Vístete con los mejores colores de la vida.</p>
                            <div className="h-10"></div>
                        </div>
                    </>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(25, 255, 255, 0.1);
                }
            `}</style>
        </div>
    )
}
