'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Heart, ShoppingCart } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const pathname = usePathname();
    const { toggleSearch } = useUI();
    const { itemCount } = useCart();

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
            <nav className="max-w-[1440px] mx-auto pl-4 md:pl-12 pr-4 md:pr-6 h-[64px] md:h-[96px] flex items-center justify-between">
                {/* Logo area - Far Left on Desktop, Center on Mobile */}
                <div className="flex-1 flex justify-center lg:justify-start">
                    <Link href="/" className="shrink-0">
                        <img src="/assets/logo.png" alt="Jagadguru Foods" className="h-[32px] md:h-[48px] lg:h-[64px] w-auto object-contain" />
                    </Link>
                </div>

                {/* Navigation and Central Logo - Desktop Only */}
                <div className="hidden lg:flex items-center justify-center gap-6 xl:gap-10 flex-[3]">
                    {/* First Half of Links */}
                    <div className="flex items-center gap-6 xl:gap-10">
                        {navLinks.slice(0, 3).map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-[12px] xl:text-[13px] font-[800] tracking-[0.15em] hover:text-[#bf8345] transition-colors whitespace-nowrap ${pathname === link.href ? 'text-[#bf8345]' : 'text-[#3a2212]'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Central Decorative Logo */}
                    <Link href="/" className="shrink-0 px-4 transform hover:scale-105 transition-transform duration-300">
                        <img src="/assets/image 74.png" alt="" className="h-[52px] md:h-[64px] lg:h-[84px] w-auto object-contain drop-shadow-md" />
                    </Link>

                    {/* Second Half of Links */}
                    <div className="flex items-center gap-6 xl:gap-10">
                        {navLinks.slice(3).map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-[12px] xl:text-[13px] font-[800] tracking-[0.15em] hover:text-[#bf8345] transition-colors whitespace-nowrap ${pathname === link.href ? 'text-[#bf8345]' : 'text-[#3a2212]'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Icons - Desktop Only */}
                <div className="hidden lg:flex items-center justify-end gap-4 xl:gap-6 flex-1">
                    <button
                        onClick={toggleSearch}
                        className="p-2 text-[#3a2212] hover:text-[#bf8345] transition-colors"
                    >
                        <Search className="w-6 h-6" />
                    </button>
                    <Link href="/login" className="p-2 text-[#3a2212] hover:text-[#bf8345] transition-colors">
                        <User className="w-6 h-6" />
                    </Link>
                    <Link href="/wishlist" className="p-2 text-[#3a2212] hover:text-[#bf8345] transition-colors">
                        <Heart className="w-6 h-6" />
                    </Link>
                    <Link href="/cart" className="p-2 text-[#3a2212] hover:text-[#bf8345] transition-colors relative">
                        <ShoppingCart className="w-6 h-6" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#bf8345] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                {itemCount}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Mobile Cart Removed from Navbar */}
            </nav>
        </header>
    );
}
