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
            router.push(`?${params.toString()}`)
        } else {
            router.push(`?${createQueryString('branch', branch)}`)
        }
    }

    return (
        <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1 space-x-1">
            <button
                onClick={() => handleBranchChange('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentBranch === 'all' || !currentBranch ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
                Todas
            </button>
            <button
                onClick={() => handleBranchChange('simon')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentBranch === 'simon' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
                Simón Bolívar
            </button>
            <button
                onClick={() => handleBranchChange('floresta')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentBranch === 'floresta' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
                Floresta
            </button>
            <button
                onClick={() => handleBranchChange('pantitlan')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentBranch === 'pantitlan' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
                Pantitlán
            </button>
        </div>
    )
}
