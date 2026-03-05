'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search, ShoppingCart, Heart, User } from 'lucide-react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const navLinks = [
        { name: 'PICKLES', href: '/category/pickles' },
        { name: 'POWDERS', href: '/category/powders' },
        { name: 'SNACKS', href: '/category/snacks' },
        { name: 'PAPADS', href: '/category/papads' },
        { name: 'PREMIX', href: '/category/premix' },
        { name: 'COMBOS', href: '/category/combos' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-orange-50/50">
            <nav className="max-w-[1440px] mx-auto px-4 md:px-6 h-[70px] md:h-[90px] flex items-center justify-between">
                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors"
                    onClick={() => setIsMenuOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6 text-[#705844]" />
                </button>

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
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        aria-label="Search"
                        className="p-2 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <Search className="w-5 h-5 md:w-6 md:h-6 text-[#705844]" />
                    </button>

                    <Link href="/login" aria-label="Profile" className="hidden sm:block p-2 hover:bg-black/5 rounded-full transition-colors">
                        <User className="w-5 h-5 md:w-6 md:h-6 text-[#705844]" />
                    </Link>

                    <Link href="/wishlist" aria-label="Wishlist" className="hidden sm:block p-2 hover:bg-black/5 rounded-full transition-colors">
                        <Heart className="w-5 h-5 md:w-6 md:h-6 text-[#705844]" />
                    </Link>

                    <Link href="/cart" aria-label="Cart" className="p-2 hover:bg-black/5 rounded-full transition-colors relative">
                        <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-[#705844]" />
                    </Link>
                </div>
            </nav>

            {/* Search Overlay */}
            {isSearchOpen && (
                <div className="absolute top-full left-0 w-full bg-white border-b border-orange-50 p-4 shadow-lg animate-in slide-in-from-top duration-300">
                    <form onSubmit={handleSearch} className="max-w-[800px] mx-auto relative">
                        <input
                            type="text"
                            placeholder="Search for pickles, snacks..."
                            className="w-full h-12 pl-4 pr-12 bg-[#fdfaf5] border border-orange-100 rounded-xl outline-none focus:border-[#be8948] transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#be8948]">
                            <Search className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            )}

            {/* Mobile Drawer */}
            {isMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="fixed top-0 left-0 h-full w-[280px] bg-white z-[70] shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        <div className="p-6 border-b border-orange-50 flex items-center justify-between">
                            <img src="/assets/logo.png" alt="Logo" className="h-10 w-auto" />
                            <button onClick={() => setIsMenuOpen(false)}>
                                <X className="w-6 h-6 text-[#705844]" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-6 px-6">
                            <div className="space-y-6">
                                <p className="text-[11px] font-[700] tracking-[0.2em] text-black/30 uppercase">CATEGORIES</p>
                                <div className="space-y-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className="block text-[15px] font-[600] text-[#705844] hover:text-[#be8948] transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-12 space-y-6">
                                <p className="text-[11px] font-[700] tracking-[0.2em] text-black/30 uppercase">ACCOUNT</p>
                                <div className="space-y-4">
                                    <Link href="/login" className="flex items-center gap-3 text-[15px] font-[600] text-[#705844]" onClick={() => setIsMenuOpen(false)}>
                                        <User className="w-5 h-5" /> Login / Profile
                                    </Link>
                                    <Link href="/wishlist" className="flex items-center gap-3 text-[15px] font-[600] text-[#705844]" onClick={() => setIsMenuOpen(false)}>
                                        <Heart className="w-5 h-5" /> Wishlist
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-orange-50">
                            <p className="text-[12px] text-black/40 text-center font-[500]">Authentic South Indian Heritage</p>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
