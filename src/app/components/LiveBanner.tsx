'use client'

import { Facebook, X } from 'lucide-react'
import { useState } from 'react'

export default function LiveBanner() {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <div className="fixed bottom-6 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-auto z-[100]">
            <div className="bg-rose-600 text-white px-5 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-[2rem] shadow-[0_20px_50px_rgba(225,29,72,0.4)] flex items-center justify-between gap-3 md:gap-6 border border-rose-400/30 backdrop-blur-md w-full">
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        <div className="absolute inset-0 w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap">Live Ahora</span>
                </div>

                <div className="hidden md:block h-4 w-px bg-white/20 shrink-0"></div>

                <a
                    href="https://www.facebook.com/groups/204246849098372/"
                    target="_blank"
                    className="text-xs md:text-sm font-bold flex items-center gap-2 hover:underline decoration-2 underline-offset-4 min-w-0 truncate"
                >
                    <Facebook className="w-4 h-4 shrink-0" />
                    <span className="truncate">¡Únete al directo y aparta tus prendas!</span>
                </a>

                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
