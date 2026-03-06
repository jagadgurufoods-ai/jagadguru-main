'use client';

import React from 'react';
import Link from 'next/link';

export default function Navbar() {
    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-orange-50/50">
            <nav className="max-w-[1440px] mx-auto px-4 md:px-6 h-[70px] md:h-[90px] flex items-center justify-center">
                {/* Logo area - Center Only */}
                <Link href="/" className="flex items-center gap-2 md:gap-4">
                    <img src="/assets/image 74.png" alt="" className="h-[40px] md:h-[60px] w-auto object-contain hidden sm:block" />
                    <img src="/assets/logo.png" alt="Jagadguru Foods" className="h-[40px] md:h-[70px] w-auto object-contain" />
                </Link>
            </nav>
        </header>
    );
}
