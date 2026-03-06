'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Heart, Star, Minus, Plus, ShoppingCart, Info, ArrowRight, Loader2, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    imageUrl?: string;
    grandmasSays?: string;
    ingredients?: string;
    pairsWellWith?: string;
    tasteMeter?: number;
    quantity?: number;
    stock: number;
    category?: {
        title: string;
    };
}

export default function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedWeight, setSelectedWeight] = useState('250g');
    const [addingToCart, setAddingToCart] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (!id) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Product not found');
                return res.json();
            })
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    const handleAddToCart = async () => {
        if (!product) return;
        setAddingToCart(true);
        try {
            await addToCart({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                imageUrl: product.imageUrl,
                stock: product.stock
            }, quantity, selectedWeight);
            setAddedToCart(true);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setAddingToCart(false);
        }
    };

    const handleQuantityChange = async (newQty: number) => {
        if (!product) return;
        if (newQty < 1) {
            setAddedToCart(false);
            setQuantity(1);
            return;
        }
        setQuantity(newQty);
        await addToCart({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            imageUrl: product.imageUrl,
            stock: product.stock
        }, newQty, selectedWeight);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fcf9f4] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#bf8345] animate-spin" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-[#fcf9f4] flex flex-col items-center justify-center space-y-6">
                <h1 className="text-4xl font-serif text-[#3a2212]">{error || 'Product not found'}</h1>
                <Link href="/" className="px-8 py-4 bg-[#bf8345] text-white rounded-xl font-bold">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcf9f4] font-sans text-[#3a2212] relative">
            {/* Toast Notification */}
            <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                <div className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-black/5 px-6 py-4 min-w-[320px]">
                    <div className="w-10 h-10 rounded-full bg-[#15a31a] flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[14px] font-[700] text-[#3a2212]">Added to Cart!</p>
                        <p className="text-[12px] text-black/40 font-[500]">{product?.name} × {quantity}</p>
                    </div>
                    <button onClick={() => setShowToast(false)} className="text-black/20 hover:text-black/50 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="max-w-[1440px] mx-auto flex">
                <main className="flex-1 max-w-7xl mx-auto">
                    {/* Top Section: Hero + Product Info */}
                    <div className="pt-8 lg:pt-24 pb-12 lg:pb-20 px-4 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                        <div className="lg:col-span-5">
                            <div className="relative group">
                                <div className="aspect-square rounded-[32px] md:rounded-[24px] overflow-hidden bg-white shadow-[0_20px_50px_-15px_rgba(191,131,69,0.15)] border border-black/5 transform transition-all duration-700">
                                    <img
                                        src={product.imageUrl || "/assets/amla_pickle_jar_premium.png"}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 space-y-8 lg:space-y-10 lg:pl-4">
                            <nav className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] font-[800] text-black/40 uppercase tracking-[0.2em]">
                                <Link href="/" className="hover:text-black">Home</Link>
                                <span className="text-[10px] opacity-20">/</span>
                                <span className="hover:text-black">{product.category?.title || 'Pickles'}</span>
                                <span className="text-[10px] opacity-20">/</span>
                                <span className="text-black/90 truncate max-w-[150px] sm:max-w-none">{product.name}</span>
                            </nav>

                            <div className="space-y-4">
                                <h1 className="text-[40px] md:text-[52px] lg:text-[64px] font-serif font-[400] text-[#3a2212] leading-[1] tracking-tight">{product.name}</h1>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star key={i} className={`w-3 h-3 md:w-3.5 md:h-3.5 ${i <= 4 ? 'fill-[#bf8345] text-[#bf8345]' : 'fill-black/5 text-black/5'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] md:text-[12px] font-[800] text-black/30 uppercase tracking-widest pt-0.5 whitespace-nowrap">128 REVIEWS</span>
                                </div>
                            </div>

                            <div className="text-[32px] sm:text-[40px] lg:text-[48px] font-sans font-[800] text-[#3a2212] tracking-tight">
                                ₹{Number(product.price).toFixed(2)}
                                {product.originalPrice && (
                                    <span className="ml-4 text-[24px] text-black/20 line-through">₹{Number(product.originalPrice).toFixed(2)}</span>
                                )}
                            </div>

                            <p className="text-[17px] text-black/45 leading-[1.8] max-w-[540px] font-[500] font-sans antialiased">
                                {product.description || 'Hand-crafted using the finest ingredients and our heritage spice blend.'}
                            </p>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 py-4">
                                <div className="flex items-center justify-between sm:justify-start bg-white rounded-[12px] border border-black/10 h-[56px] px-2 sm:px-2">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-black/40"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-6 text-[18px] font-[700] text-[#3a2212] min-w-[50px] text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-black/40"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    {['250g', '500g', '1KG'].map((w) => (
                                        <button
                                            key={w}
                                            onClick={() => setSelectedWeight(w)}
                                            className={`px-6 py-4 rounded-[12px] text-[13px] font-[800] transition-all border ${selectedWeight === w
                                                    ? 'bg-[#3a2212] text-white border-[#3a2212] shadow-lg shadow-[#3a2212]/20'
                                                    : 'bg-white text-[#3a2212]/40 border-black/10 hover:border-black/20'
                                                }`}
                                        >
                                            {w}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {addedToCart ? (
                                <div className="w-full mt-6 flex items-center justify-center">
                                    <div className="flex items-center bg-white rounded-full border-2 border-[#15a31a] h-[60px] px-4 gap-2 shadow-lg shadow-green-100/40">
                                        <button
                                            onClick={() => handleQuantityChange(quantity - 1)}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-[#15a31a]/10 rounded-full transition-colors text-[#15a31a] text-[28px] font-[700]"
                                        >
                                            −
                                        </button>
                                        <span className="px-8 text-[22px] font-[800] text-[#3a2212] min-w-[60px] text-center">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(quantity + 1)}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-[#15a31a]/10 rounded-full transition-colors text-[#15a31a] text-[28px] font-[700]"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    className="w-full py-5 bg-[#bf8345] rounded-[8px] text-white text-[15px] font-[800] tracking-[0.1em] uppercase hover:bg-[#a6713a] transition-all flex items-center justify-center gap-4 shadow-xl shadow-orange-200/40 mt-6 disabled:opacity-50"
                                >
                                    {addingToCart ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                                    ADD TO CART
                                </button>
                            )}

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 py-6 px-6 sm:px-8 bg-[#f5f1ea]/50 rounded-[12px] border border-black/5">
                                <div className="flex items-center gap-2.5 text-[11px] font-[800] text-black/40 uppercase tracking-[0.2em]">
                                    <div className="w-5 h-5 rounded-full bg-[#bf8345]/10 flex items-center justify-center ring-1 ring-[#bf8345]/20">
                                        <div className="w-2 h-2 rounded-full bg-[#bf8345]" />
                                    </div>
                                    100% ORGANIC
                                </div>
                                <div className="flex items-center gap-2.5 text-[11px] font-[800] text-black/40 uppercase tracking-[0.2em]">
                                    <div className="w-5 h-5 opacity-40">
                                        <img src="/assets/Icon.png" className="w-full h-full object-contain" />
                                    </div>
                                    PRESERVATIVE FREE
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="py-16 lg:py-32 px-6 sm:px-12 lg:px-16 border-t border-black/5 bg-[#fefaf4]">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 text-center">
                                <div className="space-y-8 px-4 flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <img src="/assets/Icon (4).png" className="w-8 h-8 object-contain" />
                                    </div>
                                    <h3 className="text-[32px] font-serif font-[500] text-[#3a2212] tracking-tight">Authentic Taste</h3>
                                    <p className="text-[16px] text-black/45 leading-[1.8] font-[500] max-w-[280px]">
                                        Our recipes are preserved over generations to bring you the true taste of tradition.
                                    </p>
                                </div>

                                <div className="space-y-8 px-4 flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <img src="/assets/Icon (5).png" className="w-8 h-8 object-contain" />
                                    </div>
                                    <h3 className="text-[32px] font-serif font-[500] text-[#3a2212] tracking-tight">Pure Ingredients</h3>
                                    <p className="text-[16px] text-black/45 leading-[1.8] font-[500] max-w-[320px]">
                                        We use only sun-dried ingredients and cold-pressed oils for maximum flavor.
                                    </p>
                                </div>

                                <div className="space-y-8 px-4 flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <img src="/assets/Icon (6).png" className="w-8 h-8 object-contain" />
                                    </div>
                                    <h3 className="text-[32px] font-serif font-[500] text-[#3a2212] tracking-tight">Nutritional Value</h3>
                                    <p className="text-[16px] text-black/45 leading-[1.8] font-[500] max-w-[280px]">
                                        Rich in antioxidants and prepared with health as a priority.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Heritage Map Layer */}
                    <section className="relative overflow-hidden py-16 lg:py-32 bg-[#fdfaf5]">
                        <div className="max-w-[1240px] mx-auto px-6 sm:px-12 relative flex items-center min-h-[400px] lg:min-h-[600px]">
                            <div className="absolute inset-x-0 top-0 bottom-0 opacity-[0.03] pointer-events-none">
                                <img src="/assets/image 73.png" className="w-full h-full object-cover scale-150" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full">
                                <div className="space-y-12 z-10 relative">
                                    <div className="space-y-4">
                                        <img src="/assets/logo.png" className="h-10 w-auto opacity-20 mb-4" />
                                        <h2 className="text-[40px] sm:text-[60px] lg:text-[84px] font-serif font-[700] text-[#3a2212] leading-[1] tracking-tighter">
                                            The Source of <br />
                                            <span className="text-[#bf8345] inline-flex items-center gap-4">
                                                Our Heritage
                                                <span className="text-[11px] font-sans font-[800] uppercase tracking-widest text-[#bf8345]/50 px-3 py-1 border border-[#bf8345]/20 rounded-full">since 1974</span>
                                            </span>
                                        </h2>
                                    </div>
                                    <p className="text-[17px] text-black/50 leading-[1.8] font-[500] max-w-[500px]">
                                        Jagadguru Foods traces its roots to the fertile lands of South India, where generations of farmers have cultivated spices and ingredients with unparalleled dedication.
                                    </p>
                                    {product.ingredients && (
                                        <div className="space-y-4">
                                            <h4 className="text-[13px] font-[800] tracking-[0.2em] text-[#bf8345] uppercase">Key Ingredients</h4>
                                            <p className="text-[15px] text-black/60 leading-relaxed max-w-[500px]">{product.ingredients}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="relative z-10">
                                    <div className="aspect-[4/5] bg-white rounded-[40px] custom-shadow-lg p-1 border border-black/5 overflow-hidden">
                                        <div className="w-full h-full p-12 flex flex-col items-center justify-center text-center space-y-8 relative">
                                            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('/assets/image 73.png')] bg-cover" />
                                            <div className="relative">
                                                <div className="w-1 h-20 bg-gradient-to-t from-[#bf8345] to-transparent mb-8 mx-auto" />
                                                <div className="w-20 h-20 rounded-full bg-[#bf8345] flex items-center justify-center shadow-2xl shadow-orange-300">
                                                    <Star className="w-8 h-8 text-white fill-white" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[11px] font-[800] tracking-[0.4em] text-[#bf8345] uppercase">Authentic Region</span>
                                                <h4 className="text-[28px] sm:text-[36px] font-serif font-[700] text-[#3a2212]">Andhra Pradesh</h4>
                                            </div>
                                            <p className="text-[14px] text-black/50 leading-relaxed max-w-[280px]">Known as the spice capital, where our journey began three generations ago.</p>

                                            <div className="absolute top-10 right-10 bg-[#bf8345]/5 px-4 py-2 rounded-full flex items-center gap-2 border border-[#bf8345]/10">
                                                <div className="w-2 h-2 rounded-full bg-[#bf8345] animate-pulse" />
                                                <span className="text-[10px] font-[800] text-[#bf8345] tracking-widest uppercase">Verified Source</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Grandma Says Section */}
                    <section className="py-16 lg:py-24 px-6 sm:px-16 bg-[#f7f3ed] border-y border-black/5">
                        <div className="max-w-4xl mx-auto text-center space-y-8 lg:space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-[32px] sm:text-[44px] lg:text-[56px] font-serif font-[700] text-[#3a2212] tracking-tight">Grandma Says</h2>
                                <div className="h-[2px] w-24 bg-[#bf8345] mx-auto opacity-20" />
                            </div>
                            <p className="text-[16px] sm:text-[20px] text-black/60 leading-[1.8] sm:leading-[2] font-[500] font-sans italic opacity-80 whitespace-pre-wrap">
                                &ldquo;{product.grandmasSays || "Authenticity is the secret ingredient in every recipe we preserve. This product is a piece of our tradition, from our family to yours."}&rdquo;
                            </p>
                        </div>
                    </section>
                </main>
            </div>

            <footer className="w-full bg-[#1a1a1a] text-white py-16 lg:py-28">
                <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16 grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-20">
                    <div className="space-y-10">
                        <img src="/assets/logo.png" alt="Jagadguru Foods" className="h-[75px] w-auto brightness-0 invert opacity-90" />
                        <p className="text-[15px] text-white/40 leading-relaxed font-[300] max-w-[280px]">Authentic South Indian pickles and powders made with traditional recipes and love.</p>
                    </div>
                    <div className="space-y-10 pt-4">
                        <h4 className="text-[13px] font-[700] tracking-[0.4em] text-white opacity-40 uppercase">Shop By</h4>
                        <ul className="space-y-5 text-[15px] text-white/50 font-[300]">
                            {['Our Story', 'All Products', 'Bulk Orders', 'Contact Us'].map(l => <li key={l} className="hover:text-white cursor-pointer transition-colors">{l}</li>)}
                        </ul>
                    </div>
                    <div className="space-y-10 pt-4">
                        <h4 className="text-[13px] font-[700] tracking-[0.4em] text-white opacity-40 uppercase">Support</h4>
                        <ul className="space-y-5 text-[15px] text-white/50 font-[300]">
                            {['Shipping Policy', 'Refund Policy', 'Terms of Service', 'Privacy Policy'].map(l => <li key={l} className="hover:text-white cursor-pointer transition-colors">{l}</li>)}
                        </ul>
                    </div>
                    <div className="space-y-10 pt-4">
                        <h4 className="text-[13px] font-[700] tracking-[0.4em] text-white opacity-40 uppercase">Newsletter</h4>
                        <div className="flex border-b border-white/10 pb-4 pt-4 group">
                            <input type="email" placeholder="Email Address" className="bg-transparent border-none outline-none text-[15px] flex-1 font-[300] placeholder-white/20" />
                            <button className="opacity-40 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
