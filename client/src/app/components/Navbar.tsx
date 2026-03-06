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
            <nav className="max-w-[1440px] mx-auto px-4 md:px-12 h-[70px] md:h-[100px] flex items-center justify-center lg:justify-between">
                {/* Logo area - Center on Mobile, Left on Desktop */}
                <Link href="/" className="flex items-center gap-2 md:gap-4 shrink-0 lg:flex-1 justify-center lg:justify-start">
                    <img src="/assets/image 74.png" alt="" className="h-[40px] md:h-[70px] w-auto object-contain hidden sm:block" />
                    <img src="/assets/logo.png" alt="Jagadguru Foods" className="h-[40px] md:h-[80px] w-auto object-contain" />
                </Link>

                {/* Navigation Links - Desktop Only */}
                <div className="hidden lg:flex items-center justify-center gap-8 xl:gap-12 flex-[2]">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-[13px] font-[800] tracking-[0.15em] hover:text-[#bf8345] transition-colors whitespace-nowrap ${pathname === link.href ? 'text-[#bf8345]' : 'text-[#3a2212]'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Icons - Desktop Only */}
                <div className="hidden lg:flex items-center justify-end gap-6 xl:gap-8 flex-1">
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
            </nav>
        </header>
    );
}
