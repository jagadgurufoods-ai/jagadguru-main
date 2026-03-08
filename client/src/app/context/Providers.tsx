'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';

import { UIProvider } from './UIContext';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <UIProvider>
                <CartProvider>
                    <WishlistProvider>
                        {children}
                    </WishlistProvider>
                </CartProvider>
            </UIProvider>
        </AuthProvider>
    );
}
