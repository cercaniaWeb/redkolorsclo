import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ArrowRight, Sparkles, ShoppingBag, Facebook } from 'lucide-react'
import Logo from './components/Logo'
import LiveBanner from './components/LiveBanner'
import LiveProducts from './components/LiveProducts'

export default function HomePage() {
    return (
        <div className="flex flex-col text-white">
            <LiveBanner />
            {/* HERO SECTION */}
            <section id="inicio" className="relative min-h-[95vh] flex items-center pt-24 overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-neutral-950 z-0">
                    <div className="absolute top-0 -left-4 w-96 h-96 bg-rose-600/20 rounded-full blur-[128px] animate-pulse"></div>
                    <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]"></div>
                </div>

                {/* Grainy Mesh Overlay */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay z-0 pointer-events-none"></div>

                <div className="container mx-auto px-6 z-10 flex flex-col lg:flex-row items-center gap-16">
                    {/* Text Content */}
                    <div className="flex-1 space-y-8 pt-12 lg:pt-0 animate-reveal">
                        <div className="flex flex-col gap-6">
                            <Logo scale={1.2} className="w-max" />
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold tracking-[0.2em] uppercase w-max">
                                <Sparkles className="w-3 h-3" />
                                Nueva Colección 2026
                            </div>
                        </div>

                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-balance">
                            Viste<br />tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-400 to-rose-600 italic font-serif pb-2 drop-shadow-sm">esencia</span>
                        </h1>

                        <p className="text-slate-400 text-lg md:text-2xl max-w-xl leading-relaxed font-light">
                            Moda exclusiva para la mujer que define su propio estilo.
                            Piezas únicas en tres sucursales diseñadas para ti.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 pt-4">
                            <Link href="/tienda" className="group bg-rose-600 hover:bg-rose-500 text-white px-10 py-5 rounded-2xl font-bold text-lg text-center transition-all shadow-2xl shadow-rose-600/40 flex items-center justify-center gap-3">
                                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Ver Colección
                            </Link>
                            <Link href="#sucursales" className="glass-light hover:bg-white/10 px-10 py-5 rounded-2xl font-bold text-lg text-center transition-all flex items-center justify-center gap-2 group">
                                Sedes
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Hero Images Grid - Refined with Glass Effects */}
                    <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 w-full h-[550px] lg:h-[700px] animate-reveal [animation-delay:200ms]">
                        {/* Large Left Image */}
                        <div className="row-span-2 relative rounded-[2rem] overflow-hidden border border-white/5 group shadow-2xl">
                            <Image src="/hero-1.jpg" alt="Estilos Vibrantes" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" priority />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-all duration-700"></div>
                            <div className="absolute bottom-8 left-8 z-10">
                                <div className="glass px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-2xl">
                                    Trends 2026
                                </div>
                            </div>
                        </div>

                        {/* Top Right Image */}
                        <div className="relative rounded-[2rem] overflow-hidden border border-white/5 group shadow-2xl">
                            <Image src="/hero-3.png" alt="Conjuntos Casuales" fill className="object-cover object-top transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80"></div>
                            <div className="absolute bottom-6 left-6 z-10">
                                <span className="text-sm font-bold opacity-80">Casual Elegante</span>
                            </div>
                        </div>

                        {/* Bottom Right Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative rounded-[2rem] overflow-hidden border border-white/5 group shadow-2xl">
                                <Image src="/hero-2.jpg" alt="Vestidos Cortos" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="relative rounded-[2rem] overflow-hidden border border-white/5 group shadow-2xl bg-slate-900">
                                <Image src="/hero-4.jpg" alt="Gala y Noche" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-rose-950/20 mix-blend-overlay group-hover:opacity-0 transition-opacity"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-bounce">
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-white to-transparent"></div>
                </div>
            </section>

            {/* LIVE FEATURED PRODUCTS */}
            <LiveProducts />

            {/* SUCURSALES - Modern Cards */}
            <section id="sucursales" className="py-32 bg-[#020617] relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24 space-y-4">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight">Cerca de <span className="text-rose-600">ti</span></h2>
                        <p className="text-slate-400 text-xl font-light">Visítanos y vive la experiencia RedKolors en persona.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {/* Simón Bolívar */}
                        <div className="glass group hover:bg-slate-900/40 rounded-[2.5rem] p-10 transition-all duration-500 hover:-translate-y-2 flex flex-col border-white/5 hover:border-rose-500/20">
                            <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center mb-10 shadow-inner border border-white/5 group-hover:scale-110 group-hover:border-rose-500/30 transition-all">
                                <MapPin className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="text-3xl font-black mb-4">Simón Bolívar</h3>
                            <p className="text-slate-400 text-lg mb-8 leading-relaxed flex-1 italic">
                                Avenida Simón Bolívar & Bugambilias, <span className="text-slate-300 font-medium">Los Reyes Centro.</span>
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Lun - Sáb</p>
                                    <p className="text-sm font-bold">10:00 - 19:00</p>
                                </div>
                                <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Dom</p>
                                    <p className="text-sm font-bold">12:00 - 19:00</p>
                                </div>
                            </div>

                            <Link href="/tienda?branch=simon" className="inline-flex items-center gap-3 text-rose-500 font-black text-lg group/link">
                                Ver Stock <ArrowRight className="w-6 h-6 group-hover/link:translate-x-2 transition-transform" />
                            </Link>
                        </div>

                        {/* Floresta - Featured */}
                        <div className="bg-gradient-to-br from-rose-600/10 to-transparent border-rose-500/20 glass group rounded-[2.5rem] p-10 transition-all duration-500 hover:-translate-y-2 flex flex-col relative overflow-hidden">
                            <div className="absolute top-10 right-10 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 px-4 rounded-full shadow-xl shadow-rose-600/20">
                                Principal
                            </div>

                            <div className="w-20 h-20 bg-rose-600/20 rounded-3xl flex items-center justify-center mb-10 shadow-inner border border-rose-500/30 group-hover:scale-110 transition-all">
                                <Sparkles className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="text-3xl font-black mb-4">Floresta</h3>
                            <p className="text-slate-400 text-lg mb-8 leading-relaxed flex-1 italic">
                                Avenida Texcoco & Avenida Floresta, <span className="text-slate-300 font-medium">Colonia Floresta.</span>
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="glass-light rounded-2xl p-4 border border-white/10">
                                    <p className="text-[10px] text-rose-300/60 font-bold uppercase tracking-wider mb-1">Lun - Sáb</p>
                                    <p className="text-sm font-bold">11:00 - 20:00</p>
                                </div>
                                <div className="glass-light rounded-2xl p-4 border border-white/10">
                                    <p className="text-[10px] text-rose-300/60 font-bold uppercase tracking-wider mb-1">Dom</p>
                                    <p className="text-sm font-bold">12:00 - 19:00</p>
                                </div>
                            </div>

                            <Link href="/tienda?branch=floresta" className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-500 py-4 rounded-2xl font-black text-lg shadow-xl shadow-rose-600/30 group-hover:scale-[1.02] transition-all">
                                Ver Colección Premium
                            </Link>
                        </div>

                        {/* Pantitlan */}
                        <div className="glass group hover:bg-slate-900/40 rounded-[2.5rem] p-10 transition-all duration-500 hover:-translate-y-2 flex flex-col border-white/5 hover:border-rose-500/20">
                            <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center mb-10 shadow-inner border border-white/5 group-hover:scale-110 group-hover:border-rose-500/30 transition-all">
                                <ShoppingBag className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="text-3xl font-black mb-4">Pantitlán</h3>
                            <p className="text-slate-400 text-lg mb-8 leading-relaxed flex-1 italic">
                                Avenida Pantitlán 656, <span className="text-slate-300 font-medium">Nezahualcóyotl.</span>
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Lun - Sáb</p>
                                    <p className="text-sm font-bold">11:00 - 20:00</p>
                                </div>
                                <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Dom</p>
                                    <p className="text-sm font-bold">12:00 - 19:00</p>
                                </div>
                            </div>

                            <Link href="/tienda?branch=pantitlan" className="inline-flex items-center gap-3 text-rose-500 font-black text-lg group/link">
                                Ver Stock <ArrowRight className="w-6 h-6 group-hover/link:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN SOCIAL / NOVEDADES */}
            <section id="novedades" className="py-32 bg-slate-950/20 border-t border-white/5">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 animate-reveal">
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black">Social <span className="text-rose-600">Feed</span></h2>
                            <p className="text-slate-400 text-xl font-light max-w-2xl">
                                Mantente conectada con nuestras últimas llegadas y anuncios exclusivos vía Facebook.
                            </p>
                        </div>
                        <a href="https://www.facebook.com/groups/204246849098372/" target="_blank" className="group bg-[#4267B2] hover:bg-[#365899] text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-xl shadow-blue-600/20">
                            <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Comunidad Privada
                        </a>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feed Card 1 */}
                        {[
                            { branch: 'Sucursal Simón', text: '🔥 Nueva llegada! Vestido floral rojo, tallas S-XL. ¡Disponible ya!', time: 'Hace 2 horas', color: 'from-rose-500' },
                            { branch: 'Sucursal Floresta', text: '✨ Conjunto negro elegante. Perfecto para salir. Precio especial esta semana.', time: 'Hace 5 horas', color: 'from-slate-600' },
                            { branch: 'Sucursal Simón', text: '💕 Blusa rosa palo con detalles bordados. ¡La favorita de la semana!', time: 'Ayer', color: 'from-rose-400' }
                        ].map((post, i) => (
                            <div key={i} className="glass rounded-[2rem] overflow-hidden group hover:border-rose-500/30 transition-all duration-500 hover:-translate-y-2">
                                <div className={`h-48 bg-gradient-to-br ${post.color} to-slate-950 p-8 flex flex-col justify-end relative overflow-hidden`}>
                                    <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full border border-white/20 text-[10px] font-bold tracking-widest uppercase">
                                        <Facebook className="w-3 h-3" /> Post
                                    </div>
                                    <div className="absolute inset-0 bg-slate-950 opacity-20 group-hover:opacity-0 transition-opacity"></div>
                                </div>
                                <div className="p-8 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{post.branch}</span>
                                    </div>
                                    <p className="text-slate-100 text-lg leading-relaxed font-medium">
                                        {post.text}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-xs text-slate-500 font-bold">{post.time}</span>
                                        <span className="text-xs text-rose-500 font-black cursor-pointer hover:underline uppercase tracking-tighter">Ver en FB</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
