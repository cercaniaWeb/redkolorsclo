'use client'

import Image from 'next/image'

interface LogoProps {
    className?: string;
    scale?: number;
}

export default function Logo({ className = "", scale = 1 }: LogoProps) {
    return (
        <div
            className={`relative inline-block select-none ${className}`}
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'left center',
                width: 'auto',
                height: 'auto'
            }}
        >
            <Image
                src="/logo-official.png"
                alt="Red Kolors Clothing"
                width={200}
                height={80}
                className="w-auto h-12 md:h-16 h-auto object-contain"
                priority
            />
        </div>
    )
}
