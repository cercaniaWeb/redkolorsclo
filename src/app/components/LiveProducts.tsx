import { supabase } from '@/lib/supabase'
import ProductCard from './ProductCard'
import { Facebook, Sparkles } from 'lucide-react'

export default async function LiveProducts() {
    // For now, we fetch products from a specific category or just the latest 4 
    // to simulate the "Live" feel until we have a proper database flag
    const { data: products } = await supabase
        .from('products')
        .select(`
            *,
            product_branches(branch_id, stock)
        `)
        .order('created_at', { ascending: false })
        .limit(4)

    if (!products || products.length === 0) return null

    return (
        <section className="py-24 relative overflow-hidden bg-slate-950/40">
            {/* Background Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>

            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1 bg-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white animate-pulse">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                Live Now
                            </div>
                            <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Modelos Destacados</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight">Recién vistos en el <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-rose-400 italic font-serif">Directo</span></h2>
                        <p className="text-slate-400 text-lg font-light max-w-xl">
                            ¿Viste algo que te encantó en Facebook? Aquí tienes acceso rápido a los modelos estrella de nuestra última transmisión.
                        </p>
                    </div>

                    <a
                        href="/tienda"
                        className="group flex items-center gap-3 text-rose-500 font-black uppercase text-xs tracking-[0.2em] hover:text-white transition-colors"
                    >
                        Explorar Todo
                        <div className="w-10 h-10 rounded-full border border-rose-500/30 flex items-center justify-center group-hover:bg-rose-600 group-hover:border-rose-600 transition-all">
                            <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </div>
                    </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="mt-16 p-8 rounded-[2.5rem] bg-gradient-to-r from-rose-900/20 to-slate-900/20 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shrink-0">
                            <Facebook className="w-6 h-6 sm:w-8 sm:h-8 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-base sm:text-lg">¿Todavía no nos sigues?</p>
                            <p className="text-slate-500 text-sm">Activa las notificaciones en Facebook para no perderte el próximo Live.</p>
                        </div>
                    </div>
                    <a
                        href="https://www.facebook.com/groups/204246849098372/"
                        target="_blank"
                        className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5"
                    >
                        Ir a Comunidad
                    </a>
                </div>
            </div>
        </section>
    )
}
