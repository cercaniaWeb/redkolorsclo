import { ShoppingBag } from 'lucide-react'

export default function LoadingTienda() {
    return (
        <div className="bg-[#020617] text-white min-h-screen">
            {/* Header Section Skeleton */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="container mx-auto text-center space-y-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-white/5 rounded-3xl skeleton"></div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-16 md:h-24 w-2/3 mx-auto skeleton rounded-2xl"></div>
                        <div className="h-6 w-1/2 mx-auto skeleton rounded-full opacity-50"></div>
                    </div>
                    <div className="flex justify-center pt-8">
                        <div className="w-64 h-12 skeleton rounded-[2rem]"></div>
                    </div>
                </div>
            </section>

            {/* Product Grid Skeleton */}
            <section className="container mx-auto px-6 pb-40">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col items-stretch">
                            <div className="aspect-[3/4] skeleton"></div>
                            <div className="p-8 space-y-4 flex-1">
                                <div className="flex justify-between gap-4">
                                    <div className="h-6 w-2/3 skeleton rounded"></div>
                                    <div className="h-6 w-12 skeleton rounded font-black"></div>
                                </div>
                                <div className="h-4 w-1/2 skeleton rounded-full opacity-50"></div>
                                <div className="space-y-2 pt-2">
                                    <div className="h-3 w-full skeleton rounded-full"></div>
                                    <div className="h-3 w-4/5 skeleton rounded-full"></div>
                                </div>
                                <div className="pt-4 mt-auto">
                                    <div className="h-14 w-full skeleton rounded-2xl"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
