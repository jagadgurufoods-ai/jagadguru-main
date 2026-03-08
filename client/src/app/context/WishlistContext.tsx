'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface WishlistItem {
    id: number;
    productId: number;
    product: any;
}

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    toggleWishlist: (productId: number) => Promise<void>;
    isInWishlist: (productId: number) => boolean;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType>({
    wishlistItems: [],
    toggleWishlist: async () => { },
    isInWishlist: () => false,
    loading: false,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { token, isLoggedIn } = useAuth();
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = useCallback(async () => {
        if (!isLoggedIn || !token) {
            setWishlistItems([]);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setWishlistItems(data);
            }
        } catch (err) {
            console.error('Failed to fetch wishlist:', err);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, token]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const toggleWishlist = async (productId: number) => {
        if (!isLoggedIn || !token) {
            alert('Please login to use wishlist');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/wishlist/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ productId })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.action === 'added') {
                    setWishlistItems(prev => [...prev, data.item]);
                } else {
                    setWishlistItems(prev => prev.filter(item => item.productId !== productId));
                }
            }
        } catch (err) {
            console.error('Failed to toggle wishlist:', err);
        }
    };

    const isInWishlist = (productId: number) => {
        return wishlistItems.some(item => item.productId === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => useContext(WishlistContext);
