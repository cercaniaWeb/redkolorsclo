'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, ShoppingCart, Minus, Plus, Trash2, Printer, XCircle, MapPin, Store, CreditCard, Wallet, DollarSign } from 'lucide-react'

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
    const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta'>('efectivo')
    const [amountTendered, setAmountTendered] = useState<number | ''>('')

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

    const addToCart = (product: any) => {
        const branchStock = product.product_branches?.find((b: any) => b.branch_id === branch)?.stock || 0
        if (branchStock <= 0) {
            alert('¡Producto agotado en esta sucursal!')
            return
        }

        const existing = cart.find(i => i.id === product.id)
        if (existing) {
            if (existing.cartQuantity >= branchStock) {
                alert('No hay más stock disponible en esta sucursal.')
                return
            }
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
        if (paymentMethod === 'efectivo' && Number(amountTendered) < totalCart) {
            alert('La cantidad recibida es menor al total de la compra.')
            return
        }

        setLoading(true)

        // 1. Create Sale Record
        const { data: saleData, error: saleError } = await supabase
            .from('sales')
            .insert({ branch_id: branch, user_id: userId, total: totalCart, payment_method: paymentMethod })
            .select()
            .single()

        if (saleError) {
            alert('Error al registrar la venta.')
            setLoading(false)
            return
        }

        // 2. Insert Sale Items and Update Stock
        for (const item of cart) {
            // insert item
            await supabase.from('sale_items').insert({
                sale_id: saleData.id,
                product_id: item.id,
                quantity: item.cartQuantity,
                price_at_time: item.price
            })
            // decrement stock
            const currentStock = item.product_branches?.find((b: any) => b.branch_id === branch)?.stock || 0
            const newStock = Math.max(0, currentStock - item.cartQuantity)
            await supabase
                .from('product_branches')
                .update({ stock: newStock })
                .match({ product_id: item.id, branch_id: branch })
        }

        // 3. Print Ticket (Browser)
        window.print()

        // 4. Reset
        setCart([])
        setIsPaymentModalOpen(false)
        await fetchProducts()
        await fetchTodaySales()
        setLoading(false)
    }

    const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className="flex h-screen bg-black overflow-hidden print:bg-white print:h-auto print:overflow-visible">

            {/* --- VISUAL POS INTERFACE --- */}
            <div className="flex-1 flex flex-col h-full print:hidden">
                {/* Header */}
                <header className="h-16 border-b border-gray-900 bg-gray-950 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-black text-red-600 tracking-tighter">RED<span className="text-white font-light">POS</span></h1>
                        <div className="h-6 w-px bg-gray-800 mx-2"></div>
                        <select
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            className="bg-gray-900 border border-gray-800 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2"
                        >
                            <option value="simon">Sucursal Simón Bolívar</option>
                            <option value="floresta">Sucursal Floresta</option>
                            <option value="pantitlan">Sucursal Pantitlán</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-xl border border-gray-800">
                            <Store className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-400">Caja de hoy:</span>
                            <span className="font-bold text-white">${todaySales.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => router.push('/admin')}
                            className="text-sm text-gray-500 hover:text-white"
                        >Volver al Admin</button>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Catalog (Left) */}
                    <div className="flex-1 flex flex-col bg-gray-950/50">
                        <div className="p-4 border-b border-gray-900">
                            <div className="relative">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar producto por nombre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-red-500"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredProducts.map(p => {
                                    const localStock = p.product_branches?.find((b: any) => b.branch_id === branch)?.stock || 0
                                    const otherBranches = p.product_branches?.filter((b: any) => b.branch_id !== branch) || []
                                    const isOut = localStock === 0

                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => addToCart(p)}
                                            className={`relative bg-gray-900 border ${isOut ? 'border-red-900/40 opacity-50' : 'border-gray-800 hover:border-red-500 cursor-pointer'} rounded-2xl overflow-hidden transition-all flex flex-col`}
                                        >
                                            <div className="relative h-32 w-full bg-white">
                                                <Image src={p.image_url} alt={p.title} fill className="object-contain p-2" />
                                            </div>
                                            <div className="p-3 flex-1 flex flex-col">
                                                <h4 className="text-sm font-bold text-gray-200 line-clamp-2 leading-tight mb-1">{p.title}</h4>
                                                <p className="text-red-500 font-black mt-auto">${p.price.toFixed(2)}</p>

                                                <div className="mt-2 text-xs flex justify-between items-center bg-black/50 p-1.5 rounded-lg border border-gray-800">
                                                    <span className={isOut ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                                                        {localStock} local
                                                    </span>

                                                    {/* Tooltip para otras sucursales */}
                                                    <div className="group relative cursor-help">
                                                        <MapPin className="w-3 h-3 text-gray-500" />
                                                        <div className="hidden group-hover:block absolute bottom-full mb-2 right-0 w-max bg-gray-800 text-white border border-gray-700 p-2 rounded-lg shadow-xl z-50">
                                                            <p className="font-bold mb-1 border-b border-gray-700 pb-1">En otras tiendas:</p>
                                                            {otherBranches.map((ob: any) => (
                                                                <div key={ob.branch_id} className="flex justify-between gap-4">
                                                                    <span className="capitalize">{branchMap[ob.branch_id] || ob.branch_id}</span>
                                                                    <span className={ob.stock > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{ob.stock}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Cart / Register (Right) */}
                    <div className="w-96 bg-gray-950 border-l border-gray-900 flex flex-col shadow-2xl z-10">
                        <div className="p-4 border-b border-gray-900 bg-gray-900/50 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-gray-400" />
                            <h2 className="font-bold text-white tracking-widest uppercase text-sm">Caja Actual</h2>
                            {cart.length > 0 && <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{cart.length}</span>}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {cart.length === 0 ? (
                                <div className="text-center text-gray-600 mt-10 text-sm">No hay productos en la caja.</div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex flex-col gap-2 p-3 bg-gray-900 border border-gray-800 rounded-xl relative group">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-bold text-gray-200 line-clamp-1 truncate w-48">{item.title}</span>
                                            <span className="font-bold text-red-500">${(item.price * item.cartQuantity).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 bg-black rounded-lg border border-gray-800 p-1">
                                                <button onClick={() => updateCartQuantity(item.id, item.cartQuantity - 1)} className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-xs font-bold text-white w-4 text-center">{item.cartQuantity}</span>
                                                <button onClick={() => updateCartQuantity(item.id, item.cartQuantity + 1)} className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button onClick={() => updateCartQuantity(item.id, 0)} className="text-xs text-red-500 opacity-0 group-hover:opacity-100 hover:underline">Quitar</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Totals & Pay */}
                        <div className="p-6 bg-black border-t border-gray-900 border-b-4 border-b-red-600">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Subtotal</span>
                                <span className="text-3xl font-black text-white">${totalCart.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={openPaymentModal}
                                disabled={cart.length === 0 || loading}
                                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-transform ${cart.length === 0 ? 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800' : 'bg-green-600 hover:bg-green-500 text-white shadow-xl shadow-green-900/30 transform hover:-translate-y-1'}`}
                            >
                                <Printer className="w-5 h-5" />
                                Cobrar e Imprimir
                            </button>
                            {cart.length > 0 && (
                                <button
                                    onClick={() => setCart([])}
                                    className="w-full mt-3 py-3 text-sm font-bold text-gray-500 hover:text-red-500 border border-transparent hover:border-red-500/30 rounded-xl transition-colors"
                                >
                                    Cancelar Venta
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PAYMENT MODAL --- */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
                    <div className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-900 flex justify-between items-center bg-gray-900/50">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <Wallet className="w-6 h-6 text-red-500" /> Confirmar Pago
                            </h2>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-500 hover:text-white"><XCircle className="w-6 h-6" /></button>
                        </div>

                        <div className="p-6 flex flex-col gap-6">
                            <div className="text-center">
                                <p className="text-gray-400 text-sm font-bold tracking-widest uppercase mb-1">Monto a Cobrar</p>
                                <p className="text-5xl font-black text-white">${totalCart.toFixed(2)}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentMethod('efectivo')}
                                    className={`p-4 rounded-xl flex flex-col items-center justify-center border-2 transition-all gap-2 ${paymentMethod === 'efectivo' ? 'bg-red-600/20 border-red-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                >
                                    <DollarSign className="w-8 h-8" />
                                    <span className="font-bold">Efectivo</span>
                                </button>
                                <button
                                    onClick={() => { setPaymentMethod('tarjeta'); setAmountTendered(totalCart); }}
                                    className={`p-4 rounded-xl flex flex-col items-center justify-center border-2 transition-all gap-2 ${paymentMethod === 'tarjeta' ? 'bg-red-600/20 border-red-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                >
                                    <CreditCard className="w-8 h-8" />
                                    <span className="font-bold">Tarjeta</span>
                                </button>
                            </div>

                            {paymentMethod === 'efectivo' && (
                                <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in">
                                    <div className="flex flex-col">
                                        <label className="text-sm font-bold text-gray-400 mb-2">Cantidad Recibida ($)</label>
                                        <input
                                            type="number"
                                            value={amountTendered}
                                            onChange={(e) => setAmountTendered(e.target.value ? Number(e.target.value) : '')}
                                            className="bg-gray-900 border border-gray-800 text-white text-3xl rounded-xl p-4 focus:ring-red-500 focus:border-red-500 text-center font-black"
                                            placeholder="0.00"
                                            min={totalCart}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-900 border border-gray-800 rounded-xl">
                                        <span className="text-gray-400 font-bold text-sm">CAMBIO A DEVOLVER:</span>
                                        <span className={`text-2xl font-black ${Number(amountTendered) >= totalCart ? 'text-green-500' : 'text-red-500'}`}>
                                            ${Math.max(0, Number(amountTendered) - totalCart).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-900/50 border-t border-gray-900">
                            <button
                                onClick={confirmPayment}
                                disabled={loading || (paymentMethod === 'efectivo' && Number(amountTendered) < totalCart)}
                                className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold text-xl rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                            >
                                <Printer className="w-6 h-6" /> Completar e Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PRINTABLE TICKET (Hidden by default, shown only @media print) --- */}
            <div className="hidden print:block w-[300px] text-black bg-white mx-auto font-mono text-sm">
                <div className="text-center mb-4">
                    <h2 className="font-bold text-lg">RED KOLORS</h2>
                    <p className="text-xs">Sucursal: {branchMap[branch]}</p>
                    <p className="text-xs">Fecha: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                    <p className="text-xs">Atendió: {userRole}</p>
                </div>

                <div className="border-t border-black border-dashed my-2"></div>

                <ul className="mb-4 space-y-2">
                    {cart.map(item => (
                        <li key={item.id} className="flex flex-col">
                            <span className="truncate">{item.title}</span>
                            <div className="flex justify-between w-full pl-4 text-xs">
                                <span>{item.cartQuantity}x ${item.price.toFixed(2)}</span>
                                <span>${(item.cartQuantity * item.price).toFixed(2)}</span>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="border-t border-black border-dashed my-2"></div>

                <div className="flex justify-between items-center font-bold text-lg mt-2 mb-2">
                    <span>TOTAL</span>
                    <span>${totalCart.toFixed(2)}</span>
                </div>

                {paymentMethod === 'efectivo' ? (
                    <>
                        <div className="flex justify-between items-center w-full text-xs">
                            <span>SU PAGO (CASH):</span>
                            <span>${Number(amountTendered).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center w-full text-xs font-bold mt-1 mb-6">
                            <span>CAMBIO:</span>
                            <span>${(Number(amountTendered) - totalCart).toFixed(2)}</span>
                        </div>
                    </>
                ) : (
                    <div className="flex justify-between items-center w-full text-xs font-bold mb-6 mt-4">
                        <span>METODO:</span>
                        <span>TARJETA (APROBADA)</span>
                    </div>
                )}

                <div className="text-center text-xs">
                    <p>¡Gracias por tu compra!</p>
                    <p>No se aceptan devoluciones de efectivo.</p>
                </div>
            </div>
        </div>
    )
}
