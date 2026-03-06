'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
    isMenuOpen: boolean;
    isSearchOpen: boolean;
    openMenu: () => void;
    closeMenu: () => void;
    toggleMenu: () => void;
    openSearch: () => void;
    closeSearch: () => void;
    toggleSearch: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const openMenu = () => { setIsMenuOpen(true); setIsSearchOpen(false); };
    const closeMenu = () => setIsMenuOpen(false);
    const toggleMenu = () => { setIsMenuOpen(!isMenuOpen); setIsSearchOpen(false); };

    const openSearch = () => { setIsSearchOpen(true); setIsMenuOpen(false); };
    const closeSearch = () => setIsSearchOpen(false);
    const toggleSearch = () => { setIsSearchOpen(!isSearchOpen); setIsMenuOpen(false); };

    return (
        <UIContext.Provider value={{
            isMenuOpen, isSearchOpen,
            openMenu, closeMenu, toggleMenu,
            openSearch, closeSearch, toggleSearch
        }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within a UIProvider');
    return context;
}
