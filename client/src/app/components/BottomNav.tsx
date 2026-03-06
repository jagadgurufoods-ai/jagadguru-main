'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { useUI } from '../context/UIContext';

export default function BottomNav() {
    const pathname = usePathname();
    const { toggleMenu, toggleSearch } = useUI();

    const navItems = [
        { name: 'MENU', icon: Menu, action: toggleMenu },
        { name: 'SEARCH', icon: Search, action: toggleSearch },
        { name: 'SHOP', icon: LayoutGrid, href: '/' },
        { name: 'CART', icon: ShoppingCart, href: '/cart' },
        { name: 'ACCOUNT', icon: User, href: '/login' },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#f8ede3] border-t border-[#3a2212]/10 px-2 py-2">
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const isActive = item.href ? pathname === item.href : false;

                    if (item.action) {
                        return (
                            <button
                                key={item.name}
                                onClick={item.action}
                                className="flex flex-col items-center gap-1 min-w-[64px] transition-all text-[#3a2212]/50 hover:text-[#bf8345]"
                            >
                                <div className="p-2 rounded-full transition-colors">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-[700] tracking-wider uppercase">{item.name}</span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href || '#'}
                            className={`flex flex-col items-center gap-1 min-w-[64px] transition-all ${isActive ? 'text-[#bf8345]' : 'text-[#3a2212]/50'}`}
                        >
                            <div className={`p-2 rounded-full transition-colors ${isActive ? 'bg-[#bf8345]/10' : ''}`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-[700] tracking-wider uppercase">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
            {/* Safe area for mobile home indicator */}
            <div className="h-4 w-full"></div>
        </div>
    );
}
