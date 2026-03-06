'use client';

import { useState, useEffect, use } from 'react';
import { Plus, Minus, Search, Heart, ShoppingCart, ChevronDown, Filter, Loader2, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { addToCart } = useCart();
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
                console.log('Fetching from API:', API_URL);
                const catRes = await fetch(`${API_URL}/categories`);
                if (!catRes.ok) throw new Error(`Failed to fetch categories: ${catRes.status}`);
                const catData = await catRes.json();
                console.log('Categories received:', catData.length);
                setCategories(catData);

                // Use case-insensitive matching for slug
                const foundCat = catData.find((c: any) => c.slug.toLowerCase() === slug.toLowerCase());
                console.log('Found Category:', foundCat?.title || 'None');
                setCurrentCategory(foundCat);

                if (foundCat) {
                    const prodRes = await fetch(`${API_URL}/products?categoryId=${foundCat.id}`);
                    if (!prodRes.ok) throw new Error(`Failed to fetch products: ${prodRes.status}`);
                    const prodData = await prodRes.json();
                    console.log('Products received for category:', prodData.length);
                    setProducts(prodData);

                    // Initialize product states
                    const initialStates = prodData.reduce((acc: any, p: any) => {
                        acc[p.id] = { quantity: 1, weight: '250g' };
                        return acc;
                    }, {});
                    setProductStates(initialStates);
                } else {
                    console.warn(`Category with slug "${slug}" not found in`, catData.map((c: any) => c.slug));
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

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-[#fcf9f4]">
                <Loader2 className="w-10 h-10 text-[#bf8345] animate-spin" />
                <p className="text-[#3a2212]/50 font-[500] tracking-wide italic">Brewing your heritage flavors...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcf9f4] font-sans text-[#3a2212]">
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
                                            <span className={`text-[15px] font-[700] ${cat.slug === slug ? 'text-[#bf8345]' : 'text-[#3a2212]/40 group-hover:text-[#3a2212]'}`}>{cat.title}</span>
                                            <ChevronDown className={`w-4 h-4 ${cat.slug === slug ? 'text-[#bf8345]' : 'text-[#3a2212]/20 group-hover:text-[#3a2212]/40'}`} />
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

                        <div className="space-y-6">
                            <h2 className="text-[14px] font-[800] uppercase tracking-widest opacity-30">Price Range</h2>
                            <div className="space-y-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="5000"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                    className="w-full accent-[#bf8345] h-1 bg-[#3a2212]/5 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-[11px] font-[800] text-[#3a2212]/30">
                                    <span>Rs. 0</span>
                                    <span>Rs. {priceRange}</span>
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
                                        className={`shrink-0 px-5 py-2.5 rounded-full text-[13px] font-[700] transition-all border ${cat.slug === slug
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
                        {!currentCategory ? (
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
                            <div className="py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-black/[0.03] rounded-full flex items-center justify-center mx-auto">
                                    <ShoppingCart className="w-8 h-8 text-black/10" />
                                </div>
                                <p className="text-black/30 font-[600] uppercase tracking-widest text-[13px]">No products in {currentCategory.title} yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                                {products.map((p) => {
                                    const state = productStates[p.id] || { quantity: 1, weight: '250g' };

                                    const handleQuantity = (delta: number) => {
                                        setProductStates(prev => ({
                                            ...prev,
                                            [p.id]: { ...prev[p.id], quantity: Math.max(1, state.quantity + delta) }
                                        }));
                                    };

                                    const handleWeight = (w: string) => {
                                        setProductStates(prev => ({
                                            ...prev,
                                            [p.id]: { ...prev[p.id], weight: w }
                                        }));
                                    };

                                    return (
                                        <div key={p.id} className="bg-white rounded-[32px] md:rounded-[40px] overflow-hidden custom-shadow-md border border-black/5 group hover:custom-shadow-xl transition-all duration-500 min-h-[420px] md:h-[580px] flex flex-col relative">
                                            <Link href={`/product/${p.id}`} className="h-[200px] md:h-[40%] w-full overflow-hidden relative block">
                                                <img src={p.imageUrl || "/assets/image 53.png"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.name} />
                                            </Link>
                                            <div className="p-6 md:p-8 text-center flex-1 flex flex-col space-y-4">
                                                <div className="space-y-1">
                                                    <Link href={`/product/${p.id}`}>
                                                        <h3 className="text-[28px] md:text-[32px] font-sans font-[700] text-[#3a2212] leading-tight truncate hover:text-[#bf8345] transition-colors">{p.name}</h3>
                                                    </Link>
                                                    <p className="text-[12px] md:text-[14px] text-black/40 font-[500] italic">Authentic {currentCategory?.title}</p>
                                                </div>
                                                <p className="text-[12px] md:text-[13px] text-black/50 leading-relaxed font-[500] max-w-[220px] mx-auto hidden md:block line-clamp-2">{p.description}</p>

                                                <div className="flex justify-center gap-2 pt-2 mt-auto">
                                                    <div className="flex items-center bg-white rounded-lg border border-black/5 h-[44px] md:h-[48px] px-1 group-hover:border-[#1ea731]/20 transition-colors">
                                                        <button
                                                            className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-black/30"
                                                            onClick={(e) => { e.preventDefault(); handleQuantity(-1); }}
                                                        >
                                                            <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                        </button>
                                                        <span className="px-3 md:px-4 text-[14px] md:text-[15px] font-[700] text-[#3a2212]">{state.quantity}</span>
                                                        <button
                                                            className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-black/30"
                                                            onClick={(e) => { e.preventDefault(); handleQuantity(1); }}
                                                        >
                                                            <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        className="flex-1 py-2.5 md:py-3 bg-[#5cb85c] rounded-[10px] text-white text-[12px] md:text-[13px] font-[800] shadow-sm hover:bg-[#4cae4c] transition-colors uppercase active:scale-[0.98]"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const pState = productStates[p.id] || { quantity: 1, weight: '250g' };
                                                            addToCart({
                                                                id: p.id,
                                                                name: p.name,
                                                                price: Number(p.price),
                                                                imageUrl: p.imageUrl,
                                                                stock: p.stock
                                                            }, pState.quantity, pState.weight);
                                                            setToastProduct(p);
                                                            setShowToast(true);
                                                            setTimeout(() => setShowToast(false), 3000);
                                                        }}
                                                    >
                                                        ADD TO CART
                                                    </button>
                                                </div>

                                                <div className="flex justify-center gap-1.5 md:gap-2">
                                                    {['250g', '500g', '1KG'].map((w) => (
                                                        <button
                                                            key={w}
                                                            onClick={(e) => { e.preventDefault(); handleWeight(w); }}
                                                            className={`flex-1 py-1 md:py-1.5 rounded-[6px] md:rounded-[8px] text-[10px] md:text-[11px] font-[700] transition-all ${state.weight === w
                                                                ? 'bg-[#3a2212] text-white shadow-sm'
                                                                : 'border border-dashed border-black/10 text-black/30 hover:border-black/20'
                                                                }`}
                                                        >
                                                            {w}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <button className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-black/30 hover:text-red-500 transition-colors border border-black/5" onClick={(e) => { e.preventDefault(); }}>
                                                <Heart className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>

                {/* Process Section */}
                <section className="py-24 border-t border-black/5">
                    <div className="text-center space-y-4 mb-20">
                        <span className="text-[14px] font-[700] text-[#bf8345] uppercase tracking-[0.3em]">HOW WE DO IT</span>
                        <h2 className="text-[64px] font-serif font-[700] text-[#3a2212] leading-tight">Four Steps.<br /><span className="text-[#bf8345] italic font-[400]">Zero Shortcuts.</span></h2>
                        <p className="text-[16px] text-[#3a2212]/50 max-w-[500px] mx-auto font-[500] leading-relaxed">Every packet follows a sacred sequence — the same one our founders used for generations.</p>
                    </div>

                    <div className="relative max-w-6xl mx-auto px-12">
                        <div className="absolute top-12 left-24 right-24 h-[1px] bg-[#3a2212]/10" />
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
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
                <div className="max-w-[1440px] mx-auto px-12 grid grid-cols-1 md:grid-cols-4 gap-16">
                    <div className="space-y-8 col-span-1 md:col-span-1">
                        <img src="/assets/logo.png" alt="Jagadguru Foods" className="h-[80px] w-auto brightness-0 invert" />
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
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
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
