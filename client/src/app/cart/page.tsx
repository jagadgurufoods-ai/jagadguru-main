'use client';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag, Loader2, ChevronRight } from 'lucide-react';

export default function CartPage() {
    const { items, itemCount, totalPrice, removeFromCart, updateQuantity, loading } = useCart();
    const { isLoggedIn } = useAuth();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-[#bf8345] animate-spin" />
                <p className="text-[#3a2212]/50 font-[500] tracking-wide">Fetching your cart...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="max-w-[1440px] mx-auto px-6 py-24 text-center">
                <div className="w-24 h-24 bg-[#bf8345]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <ShoppingBag className="w-10 h-10 text-[#bf8345]" />
                </div>
                <h1 className="text-[32px] font-serif font-[700] text-[#3a2212]">Your Cart is Empty</h1>
                <p className="mt-4 text-black/40 text-[16px] font-[500] max-w-sm mx-auto leading-relaxed">
                    Looks like you haven't added anything to your cart yet. Let's find something delicious!
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 mt-10 px-8 py-4 bg-[#bf8345] text-white rounded-xl font-[800] text-[14px] uppercase tracking-[0.1em] hover:bg-[#a6713a] transition-all shadow-xl shadow-orange-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcf9f4] pb-20">
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 md:mb-12">
                    <div className="space-y-1">
                        <Link href="/" className="flex items-center gap-2 text-[12px] font-[800] text-black/30 uppercase tracking-[0.2em] hover:text-[#bf8345] transition-colors mb-2">
                            <ArrowLeft className="w-3 h-3" />
                            Back to Store
                        </Link>
                        <h1 className="text-[32px] md:text-[48px] font-serif font-[700] text-[#3a2212] tracking-tight">Shopping Cart</h1>
                        <p className="text-[14px] font-[600] text-black/40 uppercase tracking-[0.1em]">
                            {itemCount} {itemCount === 1 ? 'Product' : 'Products'} Selected
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="group bg-white rounded-[24px] md:rounded-[32px] p-4 md:p-6 border border-black/5 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex gap-4 md:gap-8 items-center">
                                    {/* Product Image */}
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[20px] md:rounded-[24px] overflow-hidden bg-[#fdfaf5] shrink-0 border border-black/5">
                                        <img
                                            src={item.product?.imageUrl || '/assets/image 53.png'}
                                            alt={item.product?.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1 md:space-y-2">
                                            <h3 className="text-[18px] md:text-[22px] font-serif font-[700] text-[#3a2212] leading-tight truncate">
                                                {item.product?.name}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[16px] font-[800] text-[#bf8345]">₹{Number(item.product?.price || 0).toFixed(2)}</span>
                                                <span className="text-[11px] font-[700] text-black/20 uppercase tracking-widest border-l border-black/10 pl-3">250g PACK</span>
                                            </div>
                                        </div>

                                        {/* Actions Bar */}
                                        <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12 w-full md:w-auto">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center bg-[#fdfaf5] rounded-[14px] border border-black/5 p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[#3a2212]/40 hover:bg-white hover:text-[#3a2212] transition-all"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-[15px] font-[800] text-[#3a2212] w-10 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[#3a2212]/40 hover:bg-white hover:text-[#3a2212] transition-all"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Item Total & Remove */}
                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[18px] font-[800] text-[#3a2212]">₹{(Number(item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition-all group/remove"
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="w-5 h-5 group-active/remove:scale-90" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary Column */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-[32px] p-8 border border-black/5 shadow-sm sticky top-24">
                            <h2 className="text-[22px] font-serif font-[700] text-[#3a2212] mb-8">Order Summary</h2>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center group">
                                    <span className="text-[14px] font-[600] text-black/40 uppercase tracking-widest">Subtotal</span>
                                    <span className="text-[16px] font-[800] text-[#3a2212]">₹{totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[14px] font-[600] text-black/40 uppercase tracking-widest">Shipping</span>
                                    <span className="text-[14px] font-[800] text-[#15a31a] uppercase tracking-widest">Free</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-[600] text-black/40 uppercase tracking-widest">Tax (Estimated)</span>
                                        <span className="text-[10px] text-black/20 font-[500]">Applied at checkout</span>
                                    </div>
                                    <span className="text-[16px] font-[800] text-[#3a2212]">₹0.00</span>
                                </div>

                                <div className="h-px bg-black/[0.03] my-4" />

                                <div className="flex justify-between items-center">
                                    <span className="text-[18px] font-serif font-[700] text-[#3a2212]">Total Amount</span>
                                    <span className="text-[24px] font-[900] text-[#bf8345] tracking-tight">₹{totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Sticky-like Checkout Action */}
                            <div className="mt-10 space-y-4">
                                {isLoggedIn ? (
                                    <Link
                                        href="/checkout"
                                        className="group w-full flex items-center justify-center gap-3 py-5 bg-[#bf8345] rounded-2xl text-white text-[15px] font-[800] tracking-[0.1em] uppercase shadow-xl shadow-orange-200 hover:bg-[#a6713a] transition-all"
                                    >
                                        Proceed to Checkout
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="group w-full flex items-center justify-center gap-3 py-5 bg-[#3a2212] rounded-2xl text-white text-[15px] font-[800] tracking-[0.1em] uppercase shadow-xl shadow-gray-200 hover:opacity-90 transition-all"
                                    >
                                        Log In to Checkout
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}

                                <p className="text-center text-[12px] text-black/30 font-[500] px-4">
                                    Taxes and shipping fees will be calculated based on your address.
                                </p>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-8 pt-8 border-t border-black/5 flex items-center justify-center gap-6 opacity-30 grayscale pointer-events-none">
                                <img src="/assets/image (2) 1.png" className="h-4 w-auto" />
                                <img src="/assets/logo.png" className="h-6 w-auto" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
