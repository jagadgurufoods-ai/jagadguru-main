'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, User } from 'lucide-react';

export default function Navbar() {
    const navLinks = [
        { name: 'PICKLES', href: '/category/pickles' },
        { name: 'POWDERS', href: '/category/powders' },
        { name: 'SNACKS', href: '/category/snacks' },
        { name: 'PAPADS', href: '/category/papads' },
        { name: 'PREMIX', href: '/category/premix' },
        { name: 'COMBOS', href: '/category/combos' },
    ];

    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-orange-50/50">
            <nav className="max-w-[1440px] mx-auto px-4 md:px-6 h-[70px] md:h-[90px] flex items-center justify-between">
                {/* Logo area */}
                <div className="flex items-center gap-2 md:gap-4 shrink-0 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
                    <Link href="/" className="flex items-center gap-2 md:gap-4">
                        <img src="/assets/image 74.png" alt="" className="h-[40px] md:h-[60px] w-auto object-contain hidden sm:block" />
                        <img src="/assets/logo.png" alt="Jagadguru Foods" className="h-[40px] md:h-[70px] w-auto object-contain" />
                    </Link>
                </div>

                {/* Center Links (Desktop) */}
                <div className="hidden lg:flex items-center space-x-8 xl:space-x-10 text-[13px] font-[600] tracking-[0.1em] text-[#705844]">
                    {navLinks.map((link) => (
                        <Link key={link.name} href={link.href} className="hover:text-[#be8948] transition-colors">
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Action Icons */}
                <div className="flex items-center space-x-2 md:space-x-6 shrink-0">
                    <Link href="/login" aria-label="Profile" className="sm:block p-2 hover:bg-black/5 rounded-full transition-colors">
                        <User className="w-5 h-5 md:w-6 md:h-6 text-[#705844]" />
                    </Link>

                    <Link href="/wishlist" aria-label="Wishlist" className="sm:block p-2 hover:bg-black/5 rounded-full transition-colors">
                        <Heart className="w-5 h-5 md:w-6 md:h-6 text-[#705844]" />
                    </Link>
                </div>
            </nav>
        </header>
    );
}
