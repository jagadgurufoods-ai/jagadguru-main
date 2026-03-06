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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="group bg-white rounded-[24px] md:rounded-[40px] p-4 md:p-8 border border-black/[0.03] shadow-sm hover:shadow-xl hover:shadow-[#bf8345]/5 transition-all duration-500">
                                <div className="flex gap-4 md:gap-10 items-start md:items-center">
                                    {/* Product Image */}
                                    <div className="w-24 h-24 md:w-40 md:h-40 rounded-[20px] md:rounded-[32px] overflow-hidden bg-[#fdfaf5] shrink-0 border border-black/[0.02] relative group-hover:scale-[1.02] transition-transform duration-500">
                                        <img
                                            src={item.product?.imageUrl || '/assets/image 53.png'}
                                            alt={item.product?.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors" />
                                    </div>

                                    {/* Product Info & Actions Container */}
                                    <div className="flex-1 min-w-0 self-stretch flex flex-col justify-between py-1">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                            <div className="space-y-1">
                                                <h3 className="text-[18px] md:text-[26px] font-serif font-[700] text-[#3a2212] leading-tight line-clamp-2">
                                                    {item.product?.name}
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[15px] md:text-[18px] font-[800] text-[#bf8345]">₹{Number(item.product?.price || 0).toFixed(2)}</span>
                                                    <div className="h-3 w-px bg-black/10" />
                                                    <span className="text-[10px] md:text-[11px] font-[800] text-black/30 uppercase tracking-[0.15em]">{item.selectedWeight || '250g'} PACK</span>
                                                </div>
                                            </div>
                                            <div className="hidden md:block text-right">
                                                <p className="text-[20px] font-[800] text-[#3a2212] tracking-tight">₹{(Number(item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 md:mt-0 pt-4 md:pt-0 border-t border-black/[0.03] md:border-none">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center bg-[#fdfaf5] rounded-[16px] border border-black/[0.05] p-1 shadow-inner">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-9 h-9 rounded-[12px] flex items-center justify-center text-[#3a2212]/40 hover:bg-white hover:text-[#3a2212] hover:shadow-sm transition-all"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-[16px] font-[800] text-[#3a2212] w-12 text-center select-none">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-9 h-9 rounded-[12px] flex items-center justify-center text-[#3a2212]/40 hover:bg-white hover:text-[#3a2212] hover:shadow-sm transition-all"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3 md:gap-5">
                                                <div className="md:hidden text-right pr-2">
                                                    <p className="text-[16px] font-[800] text-[#3a2212]">₹{(Number(item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-red-200 hover:text-red-500 hover:bg-red-50/50 transition-all group/remove border border-transparent hover:border-red-100"
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="w-5 h-5 group-active/remove:scale-90 transition-transform" />
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
                        <div className="bg-white rounded-[40px] p-8 md:p-10 border border-black/[0.03] shadow-xl shadow-[#3a2212]/5 sticky top-24 overflow-hidden">
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#bf8345]/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                            <h2 className="text-[24px] font-serif font-[700] text-[#3a2212] mb-10 flex items-center gap-3">
                                Summary
                                <div className="h-1 flex-1 bg-gradient-to-r from-black/[0.03] to-transparent rounded-full" />
                            </h2>

                            <div className="space-y-6 relative z-10">
                                <div className="flex justify-between items-center group">
                                    <span className="text-[13px] font-[800] text-black/30 uppercase tracking-[0.2em]">Subtotal</span>
                                    <span className="text-[17px] font-[800] text-[#3a2212]">₹{totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[13px] font-[800] text-black/30 uppercase tracking-[0.2em]">Shipping</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-[900] text-[#15a31a] uppercase tracking-widest bg-[#15a31a]/10 px-2 py-0.5 rounded">Free</span>
                                        <span className="text-[17px] font-[800] text-[#3a2212]">₹0.00</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-[800] text-black/30 uppercase tracking-[0.2em]">Tax</span>
                                        <span className="text-[10px] text-black/20 font-[600] tracking-wide">Standard GST Included</span>
                                    </div>
                                    <span className="text-[17px] font-[800] text-[#3a2212]">₹{(totalPrice * 0.05).toFixed(2)}</span>
                                </div>

                                <div className="pt-8 mt-2 border-t border-black/[0.05]">
                                    <div className="flex justify-between items-end mb-10">
                                        <span className="text-[20px] font-serif font-[700] text-[#3a2212]">Total Payable</span>
                                        <div className="text-right">
                                            <span className="text-[32px] font-[900] text-[#bf8345] tracking-tight leading-none block">₹{totalPrice.toFixed(2)}</span>
                                            <span className="text-[10px] text-black/20 font-[700] uppercase tracking-widest">Calculated to include discounts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky-like Checkout Action */}
                            <div className="relative z-10 space-y-4">
                                {isLoggedIn ? (
                                    <Link
                                        href="/checkout"
                                        className="group w-full flex items-center justify-center gap-3 py-6 bg-[#bf8345] rounded-[20px] text-white text-[15px] font-[900] tracking-[0.15em] uppercase shadow-2xl shadow-orange-200/50 hover:bg-[#a6713a] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                    >
                                        Complete Purchase
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="group w-full flex items-center justify-center gap-3 py-6 bg-[#3a2212] rounded-[20px] text-white text-[15px] font-[900] tracking-[0.15em] uppercase shadow-2xl shadow-[#3a2212]/20 hover:opacity-90 transition-all"
                                    >
                                        Log In to Checkout
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}
                                <div className="pt-2 text-center">
                                    <Link href="/" className="text-[11px] font-[800] text-[#bf8345] uppercase tracking-[0.2em] hover:underline">Continue Shopping</Link>
                                </div>

                                <div className="pt-8 flex items-center justify-center gap-6 opacity-30 grayscale saturate-0">
                                    <img src="/assets/image (2) 1.png" className="h-4 w-auto" alt="Trust Badge 1" />
                                    <img src="/assets/logo.png" className="h-6 w-auto" alt="Jagadguru Logo" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
