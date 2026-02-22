'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export default function BranchSelector({ currentBranch }: { currentBranch: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)
            return params.toString()
        },
        [searchParams]
    )

    const handleBranchChange = (branch: string) => {
        if (branch === 'all') {
            const params = new URLSearchParams(searchParams.toString())
            params.delete('branch')
            router.push(`?${params.toString()}`, { scroll: false })
        } else {
            router.push(`?${createQueryString('branch', branch)}`, { scroll: false })
        }
    }

    const branches = [
        { id: 'all', label: 'Todas' },
        { id: 'simon', label: 'Bolívar' },
        { id: 'floresta', label: 'Floresta' },
        { id: 'pantitlan', label: 'Pantitlán' },
    ]

    return (
        <div className="overflow-x-auto scrollbar-hide pb-1">
            <div className="inline-flex p-1.5 bg-white/5 backdrop-blur-md border border-white/5 rounded-[2rem] shadow-inner mb-8 min-w-max mx-auto">
                {branches.map((branch) => {
                    const isActive = (currentBranch === branch.id) || (branch.id === 'all' && (!currentBranch || currentBranch === 'all'))
                    return (
                        <button
                            key={branch.id}
                            onClick={() => handleBranchChange(branch.id)}
                            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 ${isActive
                                ? 'bg-white text-black shadow-[0_5px_15px_rgba(255,255,255,0.2)]'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {branch.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
