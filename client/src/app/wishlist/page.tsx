'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

const API_URL = 'http://localhost:5001/api';

interface WishlistItem {
    id: number;
    productId: number;
    product: {
        id: number;
        name: string;
        price: number;
        imageUrl?: string;
        stock: number;
        description?: string;
    };
}

export default function WishlistPage() {
    const { token, isLoggedIn } = useAuth();
    const { addToCart } = useCart();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn || !token) {
            setLoading(false);
            return;
        }
        fetchWishlist();
    }, [isLoggedIn, token]);

    const fetchWishlist = async () => {
        try {
            const res = await fetch(`${API_URL}/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (err) {
            console.error('Failed to fetch wishlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (id: number) => {
        try {
            await fetch(`${API_URL}/wishlist/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (err) {
            console.error('Failed to remove from wishlist:', err);
        }
    };

    const handleAddToCart = async (item: WishlistItem) => {
        await addToCart({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            imageUrl: item.product.imageUrl,
            stock: item.product.stock
        });
        await removeFromWishlist(item.id);
    };

    if (!isLoggedIn) {
        return (
            <div className="max-w-[1440px] mx-auto px-6 py-20 text-center">
                <h1 className="text-[32px] font-[700] text-[#3a2212]">My Wishlist</h1>
                <p className="mt-8 text-slate-400 text-lg">Please log in to view your wishlist</p>
                <Link href="/login" className="inline-block mt-6 px-8 py-3 bg-[#bf8345] text-white rounded-[16px] font-[700] hover:bg-[#a6713a] transition-colors">
                    Login
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-[1440px] mx-auto px-6 py-20">
                <h1 className="text-[32px] font-[700] text-[#3a2212]">My Wishlist</h1>
                <p className="mt-8 text-slate-400">Loading...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="max-w-[1440px] mx-auto px-6 py-20 text-center">
                <h1 className="text-[32px] font-[700] text-[#3a2212]">My Wishlist</h1>
                <p className="mt-8 text-slate-400 text-lg">Your wishlist is empty</p>
                <Link href="/" className="inline-block mt-6 px-8 py-3 bg-[#15a31a] text-white rounded-[16px] font-[700] hover:bg-[#128a16] transition-colors">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-6 py-12">
            <h1 className="text-[32px] font-[700] text-[#3a2212] mb-8">My Wishlist ({items.length})</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-[24px] overflow-hidden border border-black/5 shadow-sm">
                        <div className="h-[200px] w-full overflow-hidden bg-slate-100">
                            {item.product.imageUrl && (
                                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="p-6 space-y-4">
                            <h3 className="text-[18px] font-[700] text-[#3a2212]">{item.product.name}</h3>
                            <p className="text-[16px] font-[700] text-[#bf8345]">₹{Number(item.product.price).toFixed(2)}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className="flex-1 py-3 bg-[#15a31a] rounded-[12px] text-white text-[13px] font-[700] hover:bg-[#128a16] transition-colors"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => removeFromWishlist(item.id)}
                                    className="py-3 px-4 border border-red-200 rounded-[12px] text-red-400 text-[13px] font-[700] hover:bg-red-50 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
