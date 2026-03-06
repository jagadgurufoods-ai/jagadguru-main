'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface CartProduct {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
    stock: number;
}

interface CartItem {
    id: number; // server cart item ID or local index
    productId: number;
    quantity: number;
    product: CartProduct;
    selectedWeight?: string;
}

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    totalPrice: number;
    loading: boolean;
    addToCart: (product: CartProduct, quantity?: number, weight?: string) => Promise<void>;
    removeFromCart: (id: number) => Promise<void>;
    updateQuantity: (id: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
    items: [],
    itemCount: 0,
    totalPrice: 0,
    loading: false,
    addToCart: async () => { },
    removeFromCart: async () => { },
    updateQuantity: async () => { },
    clearCart: async () => { },
    refreshCart: async () => { },
});

export function CartProvider({ children }: { children: ReactNode }) {
    const { token, isLoggedIn } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        if (!isLoggedIn || !token) {
            // Load from localStorage
            try {
                const saved = localStorage.getItem('jgf_cart');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setItems(Array.isArray(parsed) ? parsed : []);
                } else {
                    setItems([]);
                }
            } catch (err) {
                console.error('Failed to parse cart from local storage:', err);
                setItems([]);
            }
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data.map((item: { id: number; productId: number; quantity: number; product: CartProduct }) => ({
                    id: item.id,
                    productId: item.productId || item.product?.id,
                    quantity: item.quantity,
                    product: item.product
                })));
            }
        } catch (err) {
            console.error('Failed to fetch cart:', err);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, token]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Save to localStorage when not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            localStorage.setItem('jgf_cart', JSON.stringify(items));
        }
    }, [items, isLoggedIn]);

    const addToCart = async (product: CartProduct, quantity = 1, weight?: string) => {
        // Optimistic Update
        const optimisticId = Date.now();
        const newItem: CartItem = {
            id: optimisticId,
            productId: product.id,
            quantity,
            product,
            selectedWeight: weight
        };

        setItems(prev => {
            const existing = prev.find(i => i.productId === product.id && i.selectedWeight === weight);
            if (existing) {
                return prev.map(i =>
                    (i.productId === product.id && i.selectedWeight === weight)
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...prev, newItem];
        });

        if (isLoggedIn && token) {
            try {
                const res = await fetch(`${API_URL}/cart`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ productId: product.id, quantity, weight })
                });
                if (!res.ok) throw new Error('Failed to add');
                await fetchCart(); // Re-sync with server
            } catch (err) {
                console.error('Failed to add to cart:', err);
                await fetchCart(); // Rollback/Re-sync
            }
        }
    };

    const removeFromCart = async (id: number) => {
        const previousItems = [...items];
        setItems(prev => prev.filter(i => i.id !== id));

        if (isLoggedIn && token) {
            try {
                const res = await fetch(`${API_URL}/cart/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to remove');
                await fetchCart();
            } catch (err) {
                console.error('Failed to remove from cart:', err);
                setItems(previousItems); // Rollback
            }
        }
    };

    const updateQuantity = async (id: number, quantity: number) => {
        if (quantity < 1) return removeFromCart(id);

        const previousItems = [...items];
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));

        if (isLoggedIn && token) {
            try {
                const res = await fetch(`${API_URL}/cart/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ quantity })
                });
                if (!res.ok) throw new Error('Failed to update');
                await fetchCart();
            } catch (err) {
                console.error('Failed to update cart:', err);
                setItems(previousItems); // Rollback
            }
        }
    };

    const clearCart = async () => {
        if (isLoggedIn && token) {
            try {
                await fetch(`${API_URL}/cart`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                setItems([]);
            } catch (err) {
                console.error('Failed to clear cart:', err);
            }
        } else {
            setItems([]);
        }
    };

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + (Number(i.product?.price || 0) * i.quantity), 0);

    return (
        <CartContext.Provider value={{
            items, itemCount, totalPrice, loading,
            addToCart, removeFromCart, updateQuantity, clearCart, refreshCart: fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
