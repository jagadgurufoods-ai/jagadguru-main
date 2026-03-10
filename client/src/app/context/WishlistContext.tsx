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

export function WishlistToast({ visible, message }: { visible: boolean, message: string }) {
    if (!visible) return null;
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 animate-in slide-in-from-bottom flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
            {message}
        </div>
    );
}

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { token, isLoggedIn } = useAuth();
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '' });

    const showToast = (msg: string) => {
        setToast({ visible: true, message: msg });
        setTimeout(() => setToast({ visible: false, message: '' }), 3000);
    };

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

        const isCurrentlyInWishlist = isInWishlist(productId);

        // Optimistic UI update for instant red heart
        if (isCurrentlyInWishlist) {
            setWishlistItems(prev => prev.filter(item => item.productId !== productId));
        } else {
            setWishlistItems(prev => [...prev, { id: Date.now(), productId, product: null }]);
            showToast('Added to Wishlist!');
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
                // We sync the DB state but don't need to overwrite our optimistic state
                // unless we want real IDs. To be safe, re-fetch or just update real item.
                if (data.action === 'added') {
                    setWishlistItems(prev => {
                        const filtered = prev.filter(item => item.productId !== productId);
                        return [...filtered, data.item];
                    });
                } else {
                    setWishlistItems(prev => prev.filter(item => item.productId !== productId));
                }
            } else {
                // Revert optimistic update on failure
                if (isCurrentlyInWishlist) {
                    setWishlistItems(prev => [...prev, { id: Date.now(), productId, product: null }]);
                } else {
                    setWishlistItems(prev => prev.filter(item => item.productId !== productId));
                }
            }
        } catch (err) {
            console.error('Failed to toggle wishlist:', err);
            // Revert on error
            if (isCurrentlyInWishlist) {
                setWishlistItems(prev => [...prev, { id: Date.now(), productId, product: null }]);
            } else {
                setWishlistItems(prev => prev.filter(item => item.productId !== productId));
            }
        }
    };

    const isInWishlist = (productId: number) => {
        return wishlistItems.some(item => item.productId === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, loading }}>
            {children}
            <WishlistToast visible={toast.visible} message={toast.message} />
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => useContext(WishlistContext);
