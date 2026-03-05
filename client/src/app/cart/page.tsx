'use client';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function CartPage() {
    const { items, itemCount, totalPrice, removeFromCart, updateQuantity, loading } = useCart();
    const { isLoggedIn } = useAuth();

    if (loading) {
        return (
            <div className="max-w-[1440px] mx-auto px-6 py-20">
                <h1 className="text-[32px] font-[700] text-[#3a2212]">Your Cart</h1>
                <p className="mt-8 text-slate-400">Loading...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="max-w-[1440px] mx-auto px-6 py-20 text-center">
                <h1 className="text-[32px] font-[700] text-[#3a2212]">Your Cart</h1>
                <p className="mt-8 text-slate-400 text-lg">Your cart is empty</p>
                <Link href="/" className="inline-block mt-6 px-8 py-3 bg-[#15a31a] text-white rounded-[16px] font-[700] hover:bg-[#128a16] transition-colors">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-6 py-12">
            <h1 className="text-[32px] font-[700] text-[#3a2212] mb-8">Your Cart ({itemCount} items)</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-[24px] p-6 border border-black/5 shadow-sm flex gap-6 items-center">
                            <div className="w-24 h-24 rounded-[16px] overflow-hidden bg-slate-100 shrink-0">
                                {item.product?.imageUrl && (
                                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[18px] font-[700] text-[#3a2212] truncate">{item.product?.name}</h3>
                                <p className="text-[16px] font-[700] text-[#bf8345] mt-1">₹{Number(item.product?.price || 0).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                >
                                    −
                                </button>
                                <span className="text-[16px] font-[700] text-[#3a2212] w-8 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                            <div className="text-right">
                                <p className="text-[18px] font-[800] text-[#3a2212]">₹{(Number(item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-[13px] text-red-400 hover:text-red-600 font-[600] mt-1 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[24px] p-8 border border-black/5 shadow-sm sticky top-[110px]">
                        <h2 className="text-[20px] font-[700] text-[#3a2212] mb-6">Order Summary</h2>
                        <div className="space-y-4 text-[14px]">
                            <div className="flex justify-between text-slate-500">
                                <span>Subtotal ({itemCount} items)</span>
                                <span className="font-[700] text-[#3a2212]">₹{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>Shipping</span>
                                <span className="font-[600] text-[#15a31a]">Free</span>
                            </div>
                            <div className="h-px bg-slate-100 my-4" />
                            <div className="flex justify-between text-[18px] font-[800] text-[#3a2212]">
                                <span>Total</span>
                                <span>₹{totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                        {isLoggedIn ? (
                            <Link
                                href="/checkout"
                                className="block w-full mt-8 py-4 bg-[#15a31a] rounded-[16px] text-white text-[16px] font-[800] tracking-[0.02em] uppercase text-center hover:bg-[#128a16] transition-colors shadow-lg shadow-green-100"
                            >
                                Proceed to Checkout
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="block w-full mt-8 py-4 bg-[#bf8345] rounded-[16px] text-white text-[16px] font-[800] tracking-[0.02em] uppercase text-center hover:bg-[#a6713a] transition-colors shadow-lg shadow-orange-100"
                            >
                                Login to Checkout
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
