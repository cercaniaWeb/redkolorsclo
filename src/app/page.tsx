import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ArrowRight } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="flex flex-col text-white">
            {/* HERO SECTION */}
            <section id="inicio" className="relative min-h-[90vh] flex items-center pt-16">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black z-0"></div>
                {/* Subtle pattern or gradient */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay z-0"></div>

                <div className="container mx-auto px-4 z-10 flex flex-col md:flex-row items-center gap-12">
                    {/* Text Content */}
                    <div className="flex-1 space-y-6 pt-12 md:pt-0">
                        <p className="text-red-500 font-bold tracking-[0.2em] uppercase text-sm">Nueva Colección 2025</p>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                            Viste<br />tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 italic font-serif">esencia</span>
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed">
                            Moda exclusiva para la mujer que sabe lo que quiere.<br />
                            Tres sucursales, una sola pasión.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href="/tienda" className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-bold text-lg text-center transition-all shadow-lg shadow-red-600/30">
                                Ver Colección
                            </Link>
                            <Link href="#sucursales" className="border border-gray-700 hover:border-gray-500 bg-gray-900/50 backdrop-blur px-8 py-4 rounded-full font-bold text-lg text-center transition-all hover:bg-gray-800">
                                Nuestras Sucursales
                            </Link>
                        </div>
                    </div>

                    {/* Hero Images Grid */}
                    <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 w-full h-[500px] lg:h-[600px]">
                        {/* Large Left Image (Portrait) */}
                        <div className="row-span-2 relative rounded-2xl overflow-hidden border border-gray-800 group shadow-2xl">
                            <Image src="/hero-1.jpg" alt="Estilos Vibrantes" fill className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-all duration-500"></div>
                            <div className="absolute bottom-6 left-6 z-10">
                                <span className="bg-red-600 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-red-500 shadow-xl shadow-red-900/50">Nueva Temporada</span>
                            </div>
                        </div>

                        {/* Top Right Image (Wide) */}
                        <div className="relative rounded-2xl overflow-hidden border border-gray-800 group shadow-2xl">
                            <Image src="/hero-3.png" alt="Conjuntos Casuales" fill className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-all duration-500"></div>
                            <div className="absolute bottom-4 left-4 z-10">
                                <span className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-700 text-gray-200">Casual Chic</span>
                            </div>
                        </div>

                        {/* Bottom Right Two Images */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative rounded-2xl overflow-hidden border border-gray-800 group shadow-2xl">
                                <Image src="/hero-2.jpg" alt="Vestidos Cortos" fill className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-all duration-500"></div>
                                <div className="absolute bottom-3 left-3 z-10">
                                    <span className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gray-700 text-gray-200">Tendencia</span>
                                </div>
                            </div>
                            <div className="relative rounded-2xl overflow-hidden border border-gray-800 group shadow-2xl bg-gray-900">
                                <Image src="/hero-4.jpg" alt="Gala y Noche" fill className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-all duration-500"></div>
                                <div className="absolute bottom-3 left-3 z-10">
                                    <span className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gray-700 text-gray-200">Elegancia</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SUCURSALES */}
            <section id="sucursales" className="py-24 bg-black">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Nuestras Sucursales</h2>
                        <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Simon Bolivar */}
                        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 hover:border-red-500/30 transition-all group flex flex-col">
                            <div className="w-16 h-16 bg-gray-950 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-gray-800 group-hover:bg-red-950 transition-colors">
                                <span className="text-3xl">📍</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Simón Bolívar</h3>
                            <p className="text-gray-400 mb-4 flex-1">Avenida Simón Bolívar & Bugambilias, Los Reyes Centro, Los Reyes La Paz.</p>

                            <div className="bg-black/50 rounded-xl p-4 mb-6 border border-gray-800 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Lun a Sáb</span>
                                    <span className="text-gray-300 font-medium">10:00 - 19:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Domingo</span>
                                    <span className="text-gray-300 font-medium">12:00 - 19:00</span>
                                </div>
                            </div>

                            <Link href="/tienda?branch=simon" className="inline-flex items-center text-red-500 font-bold hover:text-red-400 mt-auto">
                                Ver catálogo <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </div>

                        {/* Floresta */}
                        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 hover:border-red-500/30 transition-all group relative flex flex-col">
                            <div className="absolute top-6 right-6 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full">
                                Destacada
                            </div>

                            <div className="w-16 h-16 bg-gray-950 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-gray-800 group-hover:bg-red-950 transition-colors">
                                <span className="text-3xl">🏬</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Floresta</h3>
                            <p className="text-gray-400 mb-4 flex-1">Avenida Texcoco & Avenida Floresta, Colonia Floresta, Los Reyes La Paz.</p>

                            <div className="bg-black/50 rounded-xl p-4 mb-6 border border-gray-800 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Lun a Sáb</span>
                                    <span className="text-gray-300 font-medium">11:00 - 20:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Domingo</span>
                                    <span className="text-gray-300 font-medium">12:00 - 19:00</span>
                                </div>
                            </div>

                            <Link href="/tienda?branch=floresta" className="inline-flex items-center text-red-500 font-bold hover:text-red-400 mt-auto">
                                Ver catálogo <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </div>

                        {/* Pantitlan */}
                        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 hover:border-red-500/30 transition-all group flex flex-col">
                            <div className="w-16 h-16 bg-gray-950 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-gray-800 group-hover:bg-red-950 transition-colors">
                                <span className="text-3xl">👗</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Pantitlán</h3>
                            <p className="text-gray-400 mb-4 flex-1">Avenida Pantitlán 656, entre Poniente 20 & 21 La Perla, Nezahualcóyotl.</p>

                            <div className="bg-black/50 rounded-xl p-4 mb-6 border border-gray-800 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Lun a Sáb</span>
                                    <span className="text-gray-300 font-medium">11:00 - 20:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Domingo</span>
                                    <span className="text-gray-300 font-medium">12:00 - 19:00</span>
                                </div>
                            </div>

                            <Link href="/tienda?branch=pantitlan" className="inline-flex items-center text-red-500 font-bold hover:text-red-400 mt-auto">
                                Ver catálogo <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* NOVEDADES */}
            <section id="novedades" className="py-24 bg-gray-950/50 border-t border-gray-900">
                <div className="container mx-auto px-4">
                    <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Novedades</h2>
                            <p className="text-gray-400 text-lg max-w-xl">Últimas publicaciones y anuncios de nuestras redes sociales directamente en nuestra tienda.</p>
                        </div>
                        <a href="https://www.facebook.com/groups/204246849098372/" target="_blank" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold w-max transition-colors">
                            Seguir en Facebook
                        </a>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Post 1 */}
                        <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:-translate-y-2 transition-transform duration-300">
                            <div className="h-48 bg-gradient-to-br from-red-900 to-red-950 p-6 flex flex-col justify-end relative">
                                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded absolute top-4 left-4">Facebook</span>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <span className="text-sm font-semibold text-gray-300">Sucursal Simón</span>
                                </div>
                                <p className="text-gray-100 font-medium mb-4">🔥 Nueva llegada! Vestido floral rojo, tallas S-XL. ¡Disponible ya!</p>
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Hace 2 horas</span>
                            </div>
                        </div>

                        {/* Post 2 */}
                        <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:-translate-y-2 transition-transform duration-300">
                            <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 p-6 flex flex-col justify-end relative">
                                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded absolute top-4 left-4">Facebook</span>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                    <span className="text-sm font-semibold text-gray-300">Sucursal Floresta</span>
                                </div>
                                <p className="text-gray-100 font-medium mb-4">✨ Conjunto negro elegante. Perfecto para salir. Precio especial esta semana.</p>
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Hace 5 horas</span>
                            </div>
                        </div>

                        {/* Post 3 */}
                        <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:-translate-y-2 transition-transform duration-300">
                            <div className="h-48 bg-gradient-to-br from-red-800 to-pink-900 p-6 flex flex-col justify-end relative">
                                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded absolute top-4 left-4">Facebook</span>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <span className="text-sm font-semibold text-gray-300">Sucursal Simón</span>
                                </div>
                                <p className="text-gray-100 font-medium mb-4">💕 Blusa rosa palo con detalles bordados. ¡La favorita de la semana!</p>
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Ayer</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
