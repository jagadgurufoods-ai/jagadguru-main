'use client';

import React, { useState } from 'react';
import { X, Search, ChevronRight, Home, ShoppingBag, User, Heart, Settings, LogOut, Package } from 'lucide-react';
import Link from 'next/link';
import { useUI } from './context/UIContext';
import { useAuth } from './context/AuthContext';

export default function GlobalUIElements() {
    const { isMenuOpen, closeMenu, isSearchOpen, closeSearch } = useUI();
    const { user, logout, isLoggedIn } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const menuItems = [
        { name: 'Home', icon: Home, href: '/' },
        { name: 'All Products', icon: Package, href: '/category/all' },
        { name: 'My Cart', icon: ShoppingBag, href: '/cart' },
        { name: 'My Wishlist', icon: Heart, href: '/wishlist' },
        { name: 'Profile', icon: User, href: isLoggedIn ? '/admin/dashboard' : '/login' },
    ];

    if (!isMenuOpen && !isSearchOpen) return null;

    return (
        <>
            {/* Sidebar Menu */}
            <div
                className={`fixed inset-0 z-[200] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <div className="absolute inset-0 bg-[#3a2212]/40 backdrop-blur-sm" onClick={closeMenu} />
                <div
                    className={`absolute left-0 top-0 bottom-0 w-[300px] bg-[#fdfaf5] shadow-2xl transition-transform duration-500 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="flex flex-col h-full">
                        {/* Menu Header */}
                        <div className="p-8 border-b border-[#3a2212]/5 flex items-center justify-between">
                            <img src="/assets/logo.png" alt="Logo" className="h-10 w-auto" />
                            <button onClick={closeMenu} className="p-2 hover:bg-black/5 rounded-full transition-colors text-[#3a2212]/50">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <nav className="flex-1 overflow-y-auto py-8 px-4">
                            <div className="space-y-2">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={closeMenu}
                                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#bf8345]/5 group transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#3a2212]/40 group-hover:text-[#bf8345] transition-colors">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-[15px] font-[700] text-[#3a2212]">{item.name}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#3a2212]/20 group-hover:translate-x-1 group-hover:text-[#bf8345] transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </nav>

                        {/* Menu Footer */}
                        <div className="p-8 border-t border-[#3a2212]/5 space-y-4">
                            {isLoggedIn ? (
                                <button
                                    onClick={() => { logout(); closeMenu(); }}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-50 text-red-600 font-[700] text-[15px]"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                        <LogOut className="w-5 h-5" />
                                    </div>
                                    Sign Out
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={closeMenu}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#bf8345] text-white font-[700] text-[15px] shadow-lg shadow-orange-200"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <User className="w-5 h-5" />
                                    </div>
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Overlay */}
            <div
                className={`fixed inset-0 z-[210] transition-all duration-500 ${isSearchOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
            >
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md" />
                <div className="absolute inset-0 p-6 md:p-20 flex flex-col items-center">
                    <button
                        onClick={closeSearch}
                        className="absolute top-8 right-8 p-3 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <X className="w-8 h-8 text-[#3a2212]" />
                    </button>

                    <div className="w-full max-w-3xl mt-20 space-y-12">
                        <div className="space-y-4 text-center">
                            <span className="text-[12px] font-[800] text-[#bf8345] uppercase tracking-[0.3em]">EXPLORE HERITAGE</span>
                            <h2 className="text-[48px] md:text-[64px] font-serif font-[700] text-[#3a2212] leading-tight">Find Your Flavor</h2>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-[#3a2212]/20 group-focus-within:text-[#bf8345] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search for pickles, powders, or snacks..."
                                autoFocus={isSearchOpen}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border-b-2 border-[#3a2212]/10 focus:border-[#bf8345] py-8 pl-20 pr-8 text-[24px] md:text-[32px] font-[500] outline-none transition-all placeholder:text-[#3a2212]/10"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        window.location.href = `/search?q=${searchQuery}`;
                                        closeSearch();
                                    }
                                }}
                            />
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[14px] font-[800] text-[#3a2212]/30 uppercase tracking-[0.2em]">Popular Searches</h4>
                            <div className="flex flex-wrap gap-3">
                                {['Amla Pickle', 'Mango Avakaya', 'Gunpowder', 'Sun-dried Chillies', 'Nallakaram'].map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => {
                                            window.location.href = `/search?q=${term}`;
                                            closeSearch();
                                        }}
                                        className="px-6 py-3 rounded-full bg-black/[0.03] hover:bg-[#bf8345] hover:text-white text-[15px] font-[600] transition-all"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
