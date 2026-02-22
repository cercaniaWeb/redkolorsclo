'use client'

import { useCartStore } from '@/store/useCartStore'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Building, MessageCircle, UploadCloud, Info, Check, ShieldCheck, ShoppingBag } from 'lucide-react'
import Logo from '../components/Logo'
import { supabase } from '@/lib/supabase'

export default function CheckoutPage() {
    const { items, getTotal, clearCart } = useCartStore()
    const router = useRouter()
    const [method, setMethod] = useState<'tarjeta' | 'transferencia' | 'whatsapp'>('transferencia')
    const [deliveryMethod, setDeliveryMethod] = useState<'envio' | 'tienda'>('envio')

    // Shipping Address State
    const [address, setAddress] = useState({
        calle: '',
        numero: '',
        colonia: '',
        cp: '',
        ciudad: '',
        estado: '',
        referencias: ''
    })

    const [loading, setLoading] = useState(false)
    const [receiptFile, setReceiptFile] = useState<File | null>(null)
    const [success, setSuccess] = useState(false)
    const [isHydrated, setIsHydrated] = useState(false)

    useEffect(() => {
        // Zustand hydration check
        const unsub = useCartStore.persist.onFinishHydration(() => setIsHydrated(true))
        if (useCartStore.persist.hasHydrated()) setIsHydrated(true)
        return () => unsub()
    }, [])

    const handleWhatsAppOrder = () => {
        let message = "Hola, mi pedido online listo para pagar en tienda o confirmar:%0A%0A"
        items.forEach(item => {
            message += `- ${item.quantity}x ${item.title} ($${item.price.toFixed(2)} c/u)%0A`
        })
        message += `%0A*Total: $${getTotal().toFixed(2)}*`
        const whatsappNumber = "529999999999"
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
    }

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault()
        if (method === 'whatsapp') {
            handleWhatsAppOrder()
            return
        }

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('Debes iniciar sesión para finalizar tu compra.')
                router.push('/login')
                setLoading(false)
                return
            }

            let receipt_url = null

            if (method === 'transferencia') {
                if (!receiptFile) {
                    alert('Por favor, sube el comprobante de transferencia antes de continuar.')
                    setLoading(false)
                    return
                }

                const fileExt = receiptFile.name.split('.').pop()
                const fileName = `receipt_${Date.now()}.${fileExt}`

                const { error: uploadError, data: uploadData } = await supabase.storage
                    .from('products')
                    .upload(`receipts/${fileName}`, receiptFile)

                if (uploadError) {
                    console.error('Upload Error:', uploadError)
                    window.alert('Error al subir el comprobante.')
                    setLoading(false)
                    return
                }

                const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(uploadData.path)
                receipt_url = publicUrl
            }

            // Create Order
            const { data: orderData, error: orderError } = await supabase
                .from('online_orders')
                .insert({
                    user_id: user.id,
                    total: getTotal(),
                    payment_method: method,
                    delivery_method: deliveryMethod,
                    receipt_url,
                    shipping_address: deliveryMethod === 'envio' ? address : null,
                    status: method === 'tarjeta' ? 'payment_approved' : 'pending_verification'
                })
                .select()
                .single()

            if (orderError) {
                console.error('Order Error:', orderError)
                alert('Error al procesar el pedido. Asegúrate de que el administrador haya ejecutado el script SQL de orders.')
                setLoading(false)
                return
            }

            // Create Order Items
            const orderItems = items.map(item => ({
                order_id: orderData.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_time: item.price
            }))

            const { error: itemsError } = await supabase
                .from('online_order_items')
                .insert(orderItems)

            if (itemsError) {
                console.error('Items Error:', itemsError)
            }

            setSuccess(true)
            // clearCart() removed from here, now in success view button to prevent race conditions
        } catch (err) {
            console.error(err)
            alert('Ocurrió un error inesperado.')
        } finally {
            setLoading(false)
        }
    }

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    if (isHydrated && items.length === 0 && !success) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center animate-reveal">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-white/5 mb-6 text-slate-500">
                    <ShoppingBag className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-2">Tu carrito está vacío</h1>
                <p className="text-slate-400 mb-8 max-w-xs mx-auto">Parece que aún no has seleccionado ninguna prenda para tu pedido.</p>
                <Link href="/tienda" className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-rose-600/20 active:scale-95">
                    Ir a la Tienda
                </Link>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center animate-reveal">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mb-8 shadow-2xl shadow-emerald-500/20">
                    <Check className="w-12 h-12 text-emerald-500" />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight mb-4">¡Orden Recibida!</h1>
                <p className="text-slate-400 max-w-lg mb-8">
                    {method === 'transferencia'
                        ? 'Tu comprobante de transferencia ha sido enviado. Nuestro personal lo verificará en ventanilla y te notificaremos cuando el pago sea aprobado para despachar tus prendas.'
                        : 'Tu pago está siendo procesado por el banco. Recibirás tu confirmación de envío en tu correo próximamente.'}
                </p>
                <button
                    onClick={() => {
                        clearCart()
                        router.push('/')
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-rose-600/20 active:scale-95"
                >
                    Volver a la Tienda
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <Logo scale={0.7} />
                    <span className="ml-auto text-xs font-black uppercase text-slate-500 tracking-widest hidden md:block">
                        Finalización Segura
                    </span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-black text-white tracking-tight mb-12 flex items-center gap-4">
                    <ShieldCheck className="w-8 h-8 text-emerald-500" /> Checkout
                </h1>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Left Col: Payment Method */}
                    <form onSubmit={handleCheckout} className="flex-1 space-y-8 animate-reveal">

                        {/* 1. Método de Entrega */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white tracking-tighter mb-4">1. Método de Entrega</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`block border rounded-2xl p-6 cursor-pointer transition-all ${deliveryMethod === 'envio' ? 'bg-rose-600/10 border-rose-500/50' : 'bg-slate-900 border-white/5 hover:border-white/20'}`}>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deliveryMethod === 'envio' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2" /><path d="M4 12h16" /><path d="M12 4v16" /></svg>
                                        </div>
                                        <h3 className={`font-black uppercase tracking-widest text-sm ${deliveryMethod === 'envio' ? 'text-white' : 'text-slate-400'}`}>Envío a Domicilio</h3>
                                    </div>
                                    <input type="radio" name="delivery" value="envio" checked={deliveryMethod === 'envio'} onChange={() => setDeliveryMethod('envio')} className="hidden" />
                                    <p className="text-xs text-slate-500">Recibe tu paquete en la puerta de tu casa por paquetería.</p>
                                </label>

                                <label className={`block border rounded-2xl p-6 cursor-pointer transition-all ${deliveryMethod === 'tienda' ? 'bg-rose-600/10 border-rose-500/50' : 'bg-slate-900 border-white/5 hover:border-white/20'}`}>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deliveryMethod === 'tienda' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                            <Building className="w-5 h-5" />
                                        </div>
                                        <h3 className={`font-black uppercase tracking-widest text-sm ${deliveryMethod === 'tienda' ? 'text-white' : 'text-slate-400'}`}>Recoger en Tienda</h3>
                                    </div>
                                    <input type="radio" name="delivery" value="tienda" checked={deliveryMethod === 'tienda'} onChange={() => setDeliveryMethod('tienda')} className="hidden" />
                                    <p className="text-xs text-slate-500">Pasa por tu mercancía a nuestras sucursales de forma gratuita.</p>
                                </label>
                            </div>
                        </div>

                        {/* Address Form (Conditionally Rendered) */}
                        {deliveryMethod === 'envio' && (
                            <div className="mt-6 space-y-4 animate-reveal">
                                <h3 className="text-sm font-black uppercase text-rose-500 tracking-widest mb-4">Información de Envío</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400 ml-1">Calle</label>
                                        <input
                                            required
                                            type="text"
                                            value={address.calle}
                                            onChange={(e) => setAddress({ ...address, calle: e.target.value })}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                                            placeholder="Ej. Av. Siempre Viva"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400 ml-1">Número Int/Ext</label>
                                        <input
                                            required
                                            type="text"
                                            value={address.numero}
                                            onChange={(e) => setAddress({ ...address, numero: e.target.value })}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                                            placeholder="Ej. 742"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400 ml-1">Colonia</label>
                                        <input
                                            required
                                            type="text"
                                            value={address.colonia}
                                            onChange={(e) => setAddress({ ...address, colonia: e.target.value })}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                                            placeholder="Ej. Centro"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400 ml-1">Código Postal</label>
                                        <input
                                            required
                                            type="text"
                                            value={address.cp}
                                            onChange={(e) => setAddress({ ...address, cp: e.target.value })}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                                            placeholder="Ej. 12345"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400 ml-1">Ciudad/Municipio</label>
                                        <input
                                            required
                                            type="text"
                                            value={address.ciudad}
                                            onChange={(e) => setAddress({ ...address, ciudad: e.target.value })}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                                            placeholder="Ej. Los Reyes Acaquilpan"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400 ml-1">Estado</label>
                                        <input
                                            required
                                            type="text"
                                            value={address.estado}
                                            onChange={(e) => setAddress({ ...address, estado: e.target.value })}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                                            placeholder="Ej. Estado de México"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1 pt-2">
                                    <label className="text-xs text-slate-400 ml-1">Referencias Adicionales</label>
                                    <textarea
                                        value={address.referencias}
                                        onChange={(e) => setAddress({ ...address, referencias: e.target.value })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-colors resize-none h-20"
                                        placeholder="Ej. Casa blanca con portón negro, frente al parque."
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {/* 2. Método de Pago */}
                        <div className="space-y-4 pt-6 border-t border-white/5">
                            <h2 className="text-xl font-bold text-white tracking-tighter mb-4">2. Método de Pago</h2>

                            <label className={`block border rounded-2xl p-6 cursor-pointer transition-all ${method === 'transferencia' ? 'bg-blue-600/10 border-blue-500/50' : 'bg-slate-900 border-white/5 hover:border-white/20'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${method === 'transferencia' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                            <Building className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className={`font-black uppercase tracking-widest text-sm ${method === 'transferencia' ? 'text-white' : 'text-slate-400'}`}>Transferencia SPEI</h3>
                                            <p className="text-xs text-slate-500 mt-1">Directo a cuenta bancaria</p>
                                        </div>
                                    </div>
                                    <input type="radio" name="payment" value="transferencia" checked={method === 'transferencia'} onChange={() => setMethod('transferencia')} className="w-5 h-5 accent-blue-500" />
                                </div>
                            </label>

                            <label className={`block border rounded-2xl p-6 cursor-pointer transition-all ${method === 'tarjeta' ? 'bg-emerald-600/10 border-emerald-500/50' : 'bg-slate-900 border-white/5 hover:border-white/20'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${method === 'tarjeta' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className={`font-black uppercase tracking-widest text-sm ${method === 'tarjeta' ? 'text-white' : 'text-slate-400'}`}>Tarjeta / Débito</h3>
                                            <p className="text-xs text-slate-500 mt-1">Visa, Mastercard, Amex</p>
                                        </div>
                                    </div>
                                    <input type="radio" name="payment" value="tarjeta" checked={method === 'tarjeta'} onChange={() => setMethod('tarjeta')} className="w-5 h-5 accent-emerald-500" />
                                </div>
                            </label>

                            <div className="pt-6 mt-6 border-t border-white/5">
                                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Alternativas Secundarias</h2>
                                <label className={`block border rounded-2xl p-6 cursor-pointer transition-all ${method === 'whatsapp' ? 'bg-green-600/10 border-green-500/50' : 'bg-slate-900 border-white/5 hover:border-white/20'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${method === 'whatsapp' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                                <MessageCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className={`font-black uppercase tracking-widest text-sm ${method === 'whatsapp' ? 'text-white' : 'text-slate-400'}`}>Pedir por WhatsApp</h3>
                                                <p className="text-xs text-slate-500 mt-1">Pagar directamente en la tienda o coordinar por chat.</p>
                                            </div>
                                        </div>
                                        <input type="radio" name="payment" value="whatsapp" checked={method === 'whatsapp'} onChange={() => setMethod('whatsapp')} className="w-5 h-5 accent-green-500" />
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Additional Transfer Requirements */}
                        {method === 'transferencia' && (
                            <div className="glass p-8 rounded-[2rem] border border-blue-500/30 animate-reveal">
                                <div className="flex items-start gap-4 mb-6">
                                    <Info className="w-6 h-6 text-blue-400 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-white mb-2">Aviso Legal y Confirmación</p>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            Al elegir Transferencia Bancaria, deberás adjuntar tu comprobante de pago ('voucher'). <br /><br />
                                            <strong className="text-rose-400">Importante:</strong> El personal de Red Kolors verificará tu transferencia de forma manual el siguiente día hábil. <br />
                                            El despacho de tu compra <span className="underline">solo se aprobará y concretará</span> una vez que el personal revise y confirme el depósito en cuenta ("visto bueno").
                                        </p>
                                    </div>
                                </div>
                                <div className="border-t border-white/5 pt-6 mt-6">
                                    <label className="block text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Sube tu Comprobante (.jpg, .png o .pdf)</label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-900/50 hover:bg-blue-600/5 transition-colors group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-blue-500 mb-2 transition-colors" />
                                            <p className="mb-2 text-sm text-slate-400 group-hover:text-white transition-colors">
                                                <span className="font-semibold">Click para subir</span> o arrastra y suelta
                                            </p>
                                            {receiptFile && <p className="text-xs text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full">{receiptFile.name}</p>}
                                        </div>
                                        <input id="dropzone-file" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                                    </label>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || items.length === 0}
                            className={`w-full flex items-center justify-center gap-3 py-6 rounded-2xl font-black text-xl md:text-2xl transition-all shadow-2xl active:scale-95 disabled:opacity-50
                                ${method === 'transferencia' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 text-white' :
                                    method === 'tarjeta' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 text-white' :
                                        'bg-green-600 hover:bg-green-500 shadow-green-600/20 text-white'}`}
                        >
                            {loading ? 'Procesando...' : method === 'whatsapp' ? 'Continuar a WhatsApp' : 'Finalizar y Pagar'}
                        </button>
                    </form>

                    {/* Right Col: Order Summary */}
                    <aside className="w-full md:w-96 shrink-0">
                        <div className="glass p-8 rounded-[2rem] border border-white/5 sticky top-28">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Resumen del Pedido</h3>

                            <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-slate-800 rounded-xl overflow-hidden shrink-0">
                                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white line-clamp-1">{item.title}</p>
                                            <p className="text-xs text-slate-500">Qnty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-bold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/5 pt-6 space-y-4">
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-sm">Subtotal</span>
                                    <span className="font-bold">${getTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-sm">Envío</span>
                                    {deliveryMethod === 'tienda' ? (
                                        <span className="text-xs font-black uppercase text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full">Gratis en Tienda</span>
                                    ) : (
                                        <span className="text-xs font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">Calculado al final</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-white/5 mt-4">
                                    <span className="text-lg font-black text-white">Total a Pagar</span>
                                    <span className="text-3xl font-black text-white">${getTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main >
        </div >
    )
} 
