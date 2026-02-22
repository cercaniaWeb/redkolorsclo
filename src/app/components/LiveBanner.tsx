'use client'

import { Facebook, X } from 'lucide-react'
import { useState } from 'react'

export default function LiveBanner() {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-bounce-slow">
            <div className="bg-rose-600 text-white px-8 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(225,29,72,0.4)] flex items-center gap-6 border border-rose-400/30 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping"></div>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Live Ahora</span>
                </div>

                <div className="h-4 w-px bg-white/20"></div>

                <a
                    href="https://www.facebook.com/groups/204246849098372/"
                    target="_blank"
                    className="text-sm font-bold flex items-center gap-2 hover:underline decoration-2 underline-offset-4"
                >
                    <Facebook className="w-5 h-5" />
                    ¡Únete al directo y aparta tus prendas!
                </a>

                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
