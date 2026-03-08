'use client';

import { useState, useEffect, use } from 'react';
import { Plus, Minus, Search, Heart, ShoppingCart, ChevronDown, Filter, Loader2, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface Variant {
    id: number;
    weight: string;
    price: number | string;
    stock: number;
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [priceRange, setPriceRange] = useState(1000);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [currentCategory, setCurrentCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [productStates, setProductStates] = useState<{ [key: number]: { quantity: number, weight: string } }>({});
    const [showToast, setShowToast] = useState(false);
    const [toastProduct, setToastProduct] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const catRes = await fetch(`${API_URL}/categories`);
                if (!catRes.ok) throw new Error(`Failed to fetch categories: ${catRes.status}`);
                const catData = await catRes.json();
                setCategories(catData);

                const foundCat = catData.find((c: any) => c.slug.toLowerCase() === slug.toLowerCase());
                setCurrentCategory(foundCat);

                if (foundCat) {
                    const prodRes = await fetch(`${API_URL}/products?categoryId=${foundCat.id}`);
                    if (!prodRes.ok) throw new Error(`Failed to fetch products: ${prodRes.status}`);
                    const prodData = await prodRes.json();
                    setProducts(prodData);

                    const initialStates = prodData.reduce((acc: any, p: any) => {
                        acc[p.id] = { quantity: 1, weight: '250g' };
                        return acc;
                    }, {});
                    setProductStates(initialStates);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    const steps = [
        { title: 'Source to Peak', desc: 'We select the finest fruits and vegetables at their nutritional peak from local organic farms.', icon: '/assets/icon_source_to_peak.png' },
        { title: 'Sun-Dry & Cure', desc: 'Traditional curing methods involve 72 hours of exposure to direct sunlight to ensure perfect texture.', icon: '/assets/icon_sun_dry_cure.png' },
        { title: 'Stone-Grind & Blend', desc: 'Spices are ground using traditional stone methods to release essential oils and intense flavor.', icon: '/assets/icon_stone_grind_blend.png' },
        { title: 'Land-Press & Seal', desc: 'Each batch is hand-pressed into glass jars and sealed with heritage techniques for freshness.', icon: '/assets/icon_press_and_seal.png' }
    ];

    const renderSkeletonCard = (i: number) => (
        <div key={i} className="bg-white rounded-[24px] md:rounded-[32px] overflow-hidden custom-shadow-md border border-black/5 flex flex-col h-[420px] md:h-[460px] w-full flex-shrink-0 relative">
            <div className="absolute top-3 right-3 md:top-4 md:right-4 w-7 h-7 md:w-8 md:h-8 bg-black/[0.03] rounded-full animate-pulse z-30" />
            <div className="h-[40%] w-full bg-black/[0.05] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
            <div className="px-4 md:px-6 pt-5 pb-6 text-center flex-1 flex flex-col justify-between overflow-hidden">
                <div className="h-[56px] md:h-[68px] flex flex-col justify-center items-center">
                    <div className="h-4 w-3/4 bg-black/[0.05] rounded-md animate-pulse mb-2" />
                    <div className="h-4 w-1/2 bg-black/[0.05] rounded-md animate-pulse" />
                </div>
                <div className="h-[28px] md:h-[32px] bg-black/[0.05] rounded-full animate-pulse mx-auto w-24" />
                <div className="flex justify-center gap-2 h-[38px] md:h-[46px]">
                    <div className="w-20 md:w-24 h-full bg-black/[0.05] rounded-[10px] animate-pulse" />
                    <div className="flex-1 h-full bg-black/[0.05] rounded-[10px] animate-pulse" />
                </div>
                <div className="flex justify-center gap-1 mt-3 h-[28px] md:h-[32px]">
                    {[1, 2, 3].map(w => (
                        <div key={w} className="flex-1 h-full bg-black/[0.03] rounded-[8px] animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fcf9f4] font-sans text-[#3a2212] overflow-x-hidden">
            {/* Toast Notification */}
            <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[250] transition-all duration-500 ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                <div className="bg-[#15a31a] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Check className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[14px] font-[800]">Added to Cart!</p>
                        <p className="text-[12px] opacity-80">{toastProduct?.name}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto">
                <div className="flex flex-col lg:flex-row">
                    {/* Left Sidebar */}
                    <aside className="hidden lg:block w-[300px] border-r border-[#3a2212]/5 pt-12 px-8 space-y-12 bg-white/20 shrink-0">
                        <div>
                            <h2 className="text-[20px] font-serif font-[700] mb-8">Categories</h2>
                            <div className="space-y-6">
                                {categories.map((cat) => (
                                    <div key={cat.id} className="space-y-4">
                                        <Link
                                            href={`/category/${cat.slug}`}
                                            className="flex justify-between items-center group cursor-pointer"
                                        >
                                            <span className={`text-[15px] font-[700] ${cat.slug.toLowerCase() === slug.toLowerCase() ? 'text-[#bf8345]' : 'text-[#3a2212]/40 group-hover:text-[#3a2212]'}`}>{cat.title}</span>
                                            <ChevronDown className={`w-4 h-4 ${cat.slug.toLowerCase() === slug.toLowerCase() ? 'text-[#bf8345]' : 'text-[#3a2212]/20 group-hover:text-[#3a2212]/40'}`} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h2 className="text-[18px] font-serif font-[700]">Filter By</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center group cursor-pointer text-[#3a2212]/30">
                                    <span className="text-[12px] font-[800] uppercase tracking-widest">No Active Filters</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#f5f1ea] rounded-[24px] p-8 space-y-4 border border-black/5">
                            <h3 className="text-[15px] font-[800] text-[#bf8345] leading-tight flex items-center gap-2">
                                Get Free Delivery
                            </h3>
                            <p className="text-[13px] text-[#3a2212]/50 font-[500]">Shop more than 2 products or products with free delivery tags</p>
                        </div>
                    </aside>

                    {/* Mobile Header */}
                    <div className="lg:hidden relative">
                        <div className="absolute inset-0 h-[240px] z-0">
                            <img
                                src={currentCategory?.imageUrl || "/assets/image 73.png"}
                                className="w-full h-full object-cover opacity-20"
                                alt=""
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-[#fcf9f4]/50 to-[#fcf9f4]" />
                        </div>

                        <div className="relative z-10 px-6 pt-8 pb-4 space-y-6">
                            <Link href="/" className="text-[10px] font-[900] text-[#bf8345] uppercase tracking-[0.3em] bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#bf8345]/10 inline-block">← BACK TO HOME</Link>
                            <div className="space-y-1">
                                <span className="text-[12px] font-[800] text-[#bf8345] uppercase tracking-[0.2em] opacity-60">HAND-CRAFTED</span>
                                <div className="flex items-center justify-between gap-4">
                                    <h1 className="text-[36px] sm:text-[42px] font-serif font-[700] tracking-tight text-[#3a2212] leading-tight">{currentCategory?.title || 'Our Products'}</h1>
                                    <button className="shrink-0 flex items-center gap-2 px-4 py-3 bg-white rounded-[16px] border border-[#3a2212]/5 text-[13px] font-[800] shadow-xl shadow-[#3a2212]/5 text-[#3a2212]">
                                        <Filter className="w-4 h-4 text-[#bf8345]" />
                                    </button>
                                </div>
                                <p className="text-[13px] text-[#3a2212]/50 font-[500] italic leading-relaxed pt-2 line-clamp-2">
                                    {currentCategory?.description || "Authentic heritage flavors passed down through generations."}
                                </p>
                            </div>

                            {/* Horizontal Categories Scroll for Mobile */}
                            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/category/${cat.slug}`}
                                        className={`shrink-0 px-5 py-2.5 rounded-full text-[13px] font-[700] transition-all border ${cat.slug.toLowerCase() === slug.toLowerCase()
                                            ? 'bg-[#3a2212] text-white border-[#3a2212] shadow-lg shadow-[#3a2212]/20'
                                            : 'bg-white text-[#3a2212]/40 border-[#3a2212]/5 hover:border-[#3a2212]/20'
                                            }`}
                                    >
                                        {cat.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <main className="flex-1 p-6 md:p-12 space-y-8 md:space-y-16">
                        {/* Title for Desktop */}
                        <div className="hidden lg:block space-y-2">
                            <h1 className="text-[48px] font-serif font-[700] tracking-tight">{currentCategory?.title || 'Our Products'}</h1>
                            <p className="text-black/40 font-[500] italic max-w-xl">{currentCategory?.description || "Authentic heritage flavors passed down through generations."}</p>
                        </div>

                        {/* Product Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                                {[1, 2, 3, 4, 5, 6].map((i) => renderSkeletonCard(i))}
                            </div>
                        ) : !currentCategory ? (
                            <div className="py-24 text-center space-y-6">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
                                    <X className="w-10 h-10 text-red-300" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-[24px] font-serif font-[700] text-[#3a2212]">Category Not Found</h2>
                                    <p className="text-black/30 font-[500] max-w-sm mx-auto">The collection you are looking for doesn't exist or has been moved.</p>
                                </div>
                                <Link href="/" className="inline-block px-8 py-3 bg-[#bf8345] text-white rounded-xl font-bold uppercase tracking-widest text-[12px] shadow-lg shadow-orange-100">Browse All Categories</Link>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="py-20 text-center space-y-6">
                                <div className="w-20 h-20 bg-black/[0.03] rounded-full flex items-center justify-center mx-auto">
                                    <ShoppingCart className="w-8 h-8 text-black/10" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-serif text-[#3a2212]">No products discovered</h3>
                                    <p className="text-black/40">We are currently updating our heritage stock for this category.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                                {products.map((p) => {
                                    const state = productStates[p.id] || { quantity: 1, weight: '250g' };
                                    const variant = p.variants?.find((v: Variant) => v.weight === state.weight);
                                    const currentPrice = variant ? Number(variant.price) : Number(p.price);
                                    const currentStock = variant ? variant.stock : p.stock;
                                    const isOutOfStock = currentStock <= 0;

                                    const handleQuantity = (delta: number) => {
                                        const newQty = Math.max(1, state.quantity + delta);
                                        if (delta > 0 && newQty > currentStock) return;
                                        setProductStates(prev => ({
                                            ...prev,
                                            [p.id]: { ...prev[p.id], quantity: newQty }
                                        }));
                                    };

                                    const handleWeight = (w: string) => {
                                        setProductStates(prev => ({
                                            ...prev,
                                            [p.id]: { ...prev[p.id], weight: w, quantity: 1 }
                                        }));
                                    };

                                    return (
                                        <div key={p.id} className="bg-white rounded-[24px] md:rounded-[32px] overflow-hidden custom-shadow-md border border-black/5 group/card hover:custom-shadow-xl transition-all duration-500 h-[420px] md:h-[460px] flex flex-col relative shrink-0">
                                            <button
                                                className="absolute top-3 right-3 md:top-4 md:right-4 w-7 h-7 md:w-8 md:h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center transition-all border border-black/5 z-30 group/heart"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleWishlist(p.id);
                                                }}
                                            >
                                                <Heart className={`w-3.5 h-3.5 md:w-4.5 md:h-4.5 transition-colors ${isInWishlist(p.id) ? 'fill-red-500 text-red-500' : 'text-black/30 group-heart:text-red-400'}`} />
                                            </button>
                                            <Link href={`/product/${p.id}`} className="h-[40%] w-full overflow-hidden relative block flex-shrink-0 bg-black/[0.03]">
                                                <img
                                                    src={p.imageUrl || "/assets/image 53.png"}
                                                    className={`w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                                                    alt={p.name}
                                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/image 53.png'; }}
                                                />
                                                {isOutOfStock && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                                                        <span className="bg-white text-red-600 px-4 py-2 rounded-full font-black text-xs md:text-sm tracking-widest shadow-xl transform -rotate-12 border-2 border-red-600 uppercase">
                                                            Out of Stock
                                                        </span>
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="px-4 md:px-6 pt-5 pb-6 text-center flex-1 flex flex-col justify-between overflow-hidden">
                                                <Link href={`/product/${p.id}`} className="flex flex-col flex-shrink-0">
                                                    <div className="h-[56px] md:h-[68px] flex flex-col justify-center">
                                                        <h3 className="text-[14px] md:text-[18px] font-sans font-[700] text-[#000] leading-[1.2] line-clamp-2 group-hover:text-[#bf8345] transition-colors uppercase tracking-tight">{p.name}</h3>
                                                        <p className="text-[10px] md:text-[12px] text-black/50 font-[500] italic line-clamp-2 mt-1 leading-relaxed min-h-[32px]">
                                                            {p.description || "Authentic heritage flavors passed down through generations."}
                                                        </p>
                                                    </div>
                                                </Link>

                                                <div className="w-full">
                                                    <div className="h-[28px] md:h-[32px] flex items-center justify-center flex-shrink-0">
                                                        <span className="text-[17px] md:text-[20px] font-[800] text-[#3a2212]">₹{currentPrice.toFixed(0)}</span>
                                                        <span className="text-[11px] md:text-[13px] text-black/30 font-[600] ml-1">/ {state.weight}</span>
                                                    </div>

                                                    <div className="flex justify-center gap-2 h-[38px] md:h-[46px] relative z-30 flex-shrink-0 mt-3">
                                                        <div className={`flex items-center bg-[#fdfaf5] rounded-xl border border-black/5 h-full px-1 transition-colors ${isOutOfStock ? 'opacity-30 pointer-events-none' : ''}`}>
                                                            <button
                                                                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-black/30"
                                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantity(-1); }}
                                                            >
                                                                <Minus className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#bf8345]/60" />
                                                            </button>
                                                            <span className="px-1.5 md:px-2 text-[14px] md:text-[15px] font-[800] text-[#3a2212] min-w-[20px] text-center font-sans">{state.quantity}</span>
                                                            <button
                                                                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-black/30"
                                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantity(1); }}
                                                            >
                                                                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#bf8345]/60" />
                                                            </button>
                                                        </div>
                                                        <button
                                                            disabled={isOutOfStock}
                                                            className={`flex-1 h-full rounded-xl text-white text-[11px] md:text-[13px] font-[800] shadow-md transition-all uppercase active:scale-[0.98] flex items-center justify-center tracking-widest ${isOutOfStock ? 'bg-slate-300 shadow-none' : 'bg-[#5cb85c] hover:bg-[#4cae4c] shadow-green-100'}`}
                                                            onClick={(e) => {
                                                                if (isOutOfStock) return;
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                const pState = productStates[p.id] || { quantity: 1, weight: '250g' };
                                                                addToCart({
                                                                    id: p.id,
                                                                    name: p.name,
                                                                    price: currentPrice,
                                                                    imageUrl: p.imageUrl,
                                                                    stock: currentStock
                                                                }, pState.quantity, pState.weight);
                                                                setToastProduct(p);
                                                                setShowToast(true);
                                                                setTimeout(() => setShowToast(false), 3000);
                                                            }}
                                                        >
                                                            {isOutOfStock ? 'NO STOCK' : 'ADD TO CART'}
                                                        </button>
                                                    </div>

                                                    <div className="flex justify-center gap-1 mt-3 h-[28px] md:h-[32px] flex-shrink-0 relative z-30">
                                                        {['250g', '500g', '1KG'].map((w: string) => {
                                                            const v = p.variants?.find((v: Variant) => v.weight === w);
                                                            const vStock = v ? v.stock : p.stock;
                                                            const isSel = state.weight === w;

                                                            return (
                                                                <button
                                                                    key={w}
                                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleWeight(w); }}
                                                                    className={`flex-1 flex flex-col items-center justify-center rounded-[8px] text-[8px] md:text-[10px] px-0.5 font-[700] transition-all whitespace-nowrap overflow-hidden ${isSel
                                                                        ? 'bg-[#3a2212] text-white shadow-sm'
                                                                        : 'border border-dashed border-black/10 text-black/30 hover:border-black/20'
                                                                        } ${vStock <= 0 ? (isSel ? 'bg-[#3a2212]/80' : 'opacity-40 grayscale') : ''}`}
                                                                >
                                                                    <span>{w}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>

                {/* Process Section */}
                <section className="py-24 border-t border-black/5">
                    <div className="text-center space-y-4 mb-20 px-6">
                        <span className="text-[14px] font-[700] text-[#bf8345] uppercase tracking-[0.3em]">HOW WE DO IT</span>
                        <h2 className="text-[42px] md:text-[64px] font-serif font-[700] text-[#3a2212] leading-tight max-w-[800px] mx-auto">Four Steps.<br /><span className="text-[#bf8345] italic font-[400]">Zero Shortcuts.</span></h2>
                        <p className="text-[16px] text-[#3a2212]/50 max-w-[500px] mx-auto font-[500] leading-relaxed">Every packet follows a sacred sequence — the same one our founders used for generations.</p>
                    </div>

                    <div className="relative max-w-6xl mx-auto px-6 md:px-12">
                        <div className="hidden md:block absolute top-12 left-24 right-24 h-[1px] bg-[#3a2212]/10" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 relative">
                            {steps.map((step, i) => (
                                <div key={i} className="flex flex-col items-center text-center space-y-6 group">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-white border border-black/5 shadow-xl flex items-center justify-center transform transition-transform group-hover:scale-110 duration-500">
                                            <img src={step.icon} alt={step.title} className="w-12 h-12 object-contain" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#bf8345] rounded-full flex items-center justify-center text-white text-[12px] font-[800] border-2 border-[#fefaf4]">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-[17px] font-[800] text-[#3a2212] uppercase tracking-[0.05em]">{step.title}</h3>
                                        <p className="text-[13px] text-black/40 leading-relaxed font-[500]">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="w-full bg-[#1a1a1a] text-white py-20 mt-20">
                <div className="max-w-[1440px] mx-auto px-8 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-16">
                    <div className="space-y-8 col-span-1 md:col-span-1">
                        <img src="/assets/logo.png" alt="Jagadguru Foods" className="h-[60px] md:h-[80px] w-auto brightness-0 invert" />
                        <p className="text-[14px] text-white/60 leading-relaxed font-[300]">Authentic South Indian pickles and powders made with traditional recipes and love.</p>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">f</div>
                            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">i</div>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <h4 className="text-[14px] font-[700] tracking-[0.2em] uppercase">QUICK LINKS</h4>
                        <ul className="space-y-4 text-[14px] text-white/50 font-[300]">
                            <li className="hover:text-white cursor-pointer transition-colors">Our Story</li>
                            <li className="hover:text-white cursor-pointer transition-colors">All Products</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Bulk Orders</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Contact Us</li>
                        </ul>
                    </div>
                </div>
            </footer>

            {/* Toast Notification */}
            <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[250] transition-all duration-500 ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                <div className="bg-[#15a31a] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Check className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[14px] font-[800]">Added to Cart!</p>
                        <p className="text-[12px] opacity-80">{toastProduct?.name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
