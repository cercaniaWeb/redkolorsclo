'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, CreditCard, ShoppingBag, User, LogOut, ArrowLeft, Star, Clock, Home, Award, ChevronRight } from 'lucide-react'
import Logo from '../components/Logo'

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [favoriteBranch, setFavoriteBranch] = useState<string>('ninguna')
    const [savedCards, setSavedCards] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile')
    const router = useRouter()

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            const { user } = session
            setUser(user)

            const [profRes, ordersRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('online_orders').select('*, online_order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false })
            ])

            if (profRes.data) {
                setProfile(profRes.data)
                setFavoriteBranch(profRes.data.favorite_branch || 'ninguna')
            }

            if (ordersRes.data) {
                setOrders(ordersRes.data)
            }

            setLoading(false)
        }

        fetchUser()
    }, [router])

    const savePreferences = async () => {
        if (!user) return
        await supabase.from('profiles').upsert({ id: user.id, favorite_branch: favoriteBranch })
        alert('Preferencias guardadas exitosamente')
    }

    const unmockCard = () => {
        alert("En producción, la gestión de tarjetas utiliza Stripe Elements por cumplimiento de seguridad PCI.")
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-rose-500/30">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Logo scale={0.7} />
                    </div>
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut()
                            router.push('/')
                        }}
                        className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors text-sm font-bold"
                    >
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row items-start gap-12">

                    {/* User Card */}
                    <div className="w-full md:w-1/3 space-y-6">
                        <div className="glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border-2 border-rose-500/20 shadow-xl">
                                    <span className="text-3xl font-black text-rose-500">{user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-white">{user?.user_metadata?.full_name || 'Mi Perfil'}</h1>
                                    <p className="text-slate-400 text-sm">{user?.email}</p>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nivel Actual</p>
                                        <p className="font-bold text-white">RED Member</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-white">0</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-rose-500">Puntos</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="glass rounded-[2rem] p-4 border-white/5">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors font-bold ${activeTab === 'orders' ? 'bg-white/5 text-rose-500' : 'hover:bg-white/5 text-white'}`}
                            >
                                <span className="flex items-center gap-3"><ShoppingBag className="w-5 h-5 text-slate-400" /> Mis Pedidos</span>
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors font-bold ${activeTab === 'profile' ? 'bg-white/5 text-rose-500' : 'hover:bg-white/5 text-white'}`}
                            >
                                <span className="flex items-center gap-3"><User className="w-5 h-5" /> Ajustes de Cuenta</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="w-full md:w-2/3 space-y-8 animate-reveal">

                        {activeTab === 'orders' ? (
                            <section className="space-y-6">
                                <h1 className="text-3xl font-black text-white tracking-tight">Mis Pedidos</h1>
                                {orders.length === 0 ? (
                                    <div className="glass p-12 rounded-[2.5rem] border-white/5 text-center">
                                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                            <ShoppingBag className="w-6 h-6 text-slate-500" />
                                        </div>
                                        <p className="text-slate-400">Aún no has realizado ningún pedido.</p>
                                        <Link href="/tienda" className="inline-block mt-4 text-rose-500 font-bold hover:underline">Ir a la tienda</Link>
                                    </div>
                                ) : (
                                    orders.map((order) => (
                                        <div key={order.id} className="glass p-8 rounded-[2rem] border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Pedido #{order.id.split('-')[0]}</p>
                                                    <p className="text-sm text-white font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-4 items-center">
                                                    <div className="px-4 py-2 rounded-xl bg-slate-900 border border-white/5">
                                                        <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Total</p>
                                                        <p className="text-white font-black">${order.total.toFixed(2)}</p>
                                                    </div>
                                                    <div className={`px-4 py-2 rounded-xl border ${order.status === 'payment_approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                        order.status === 'payment_rejected' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                                            'bg-slate-900 border-white/10 text-slate-400'
                                                        }`}>
                                                        <p className="text-[10px] font-black uppercase mb-1">Estado</p>
                                                        <p className="font-bold uppercase tracking-tight text-[10px]">
                                                            {order.status === 'pending_verification' ? 'En Verificación' :
                                                                order.status === 'payment_approved' ? 'Pago Aprobado' :
                                                                    order.status === 'payment_rejected' ? 'Pago Rechazado' : order.status}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-3 text-slate-400">
                                                    <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {order.payment_method}</span>
                                                    <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                                                    <span className="flex items-center gap-1"><Home className="w-3 h-3" /> {order.delivery_method}</span>
                                                </div>
                                                {order.status === 'pending_verification' && (
                                                    <div className="flex items-center gap-2 text-rose-400 font-bold">
                                                        <Clock className="w-3 h-3" /> Validando tu ticket...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </section>
                        ) : (
                            <>
                                <section className="glass p-10 rounded-[2.5rem] border-white/5 shadow-2xl">
                                    <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                        <MapPin className="w-6 h-6 text-emerald-500" /> Preferencias de Compra
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Sucursal Favorita (Para Recoger Pickup)</label>
                                            <select
                                                value={favoriteBranch}
                                                onChange={(e) => setFavoriteBranch(e.target.value)}
                                                className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-bold appearance-none"
                                            >
                                                <option value="ninguna">Ninguna / Envíos a Domicilio</option>
                                                <option value="simon">Colonia Simón Bolívar</option>
                                                <option value="floresta">Colonia La Floresta</option>
                                                <option value="pantitlan">Colonia Pantitlán</option>
                                            </select>
                                        </div>

                                        <div className="pt-4 border-t border-white/5">
                                            <button
                                                onClick={savePreferences}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                                            >
                                                Guardar Preferencias
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                <section className="glass p-10 rounded-[2.5rem] border-white/5 shadow-2xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                            <CreditCard className="w-6 h-6 text-blue-500" /> Métodos de Pago Guardados
                                        </h2>
                                        <button onClick={unmockCard} className="text-sm font-bold text-blue-500 hover:text-blue-400">
                                            + Agregar Tarjeta
                                        </button>
                                    </div>

                                    {savedCards.length === 0 ? (
                                        <div className="bg-slate-900/50 border border-dashed border-white/10 rounded-3xl p-10 text-center space-y-4">
                                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-400">
                                                <CreditCard className="w-8 h-8 opacity-50" />
                                            </div>
                                            <p className="text-slate-400 font-medium">No tienes métodos de pago guardados.</p>
                                            <p className="text-xs text-slate-500">Agrega una tarjeta para pagar más rápido (Procesado de forma segura por Stripe).</p>
                                        </div>
                                    ) : (
                                        <div>
                                            {/* Mapped saved cards would go here */}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
