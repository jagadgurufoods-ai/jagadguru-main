'use client';

import { useState } from 'react';
import { Plus, Minus, Search, Heart, ShoppingCart, ChevronDown, Filter } from 'lucide-react';
import Link from 'next/link';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const [priceRange, setPriceRange] = useState(500);

    const categories = [
        { name: 'Pickles', count: 5, sub: ['Magaya', 'Magaya', 'Magaya', 'Magaya', 'Magaya'] },
        { name: 'Powders', count: 0 },
        { name: 'Snacks', count: 0 }
    ];

    const filters = [
        { name: 'Mango Special', count: 5 },
        { name: 'Spiced Blends', count: 3 },
        { name: 'South & Hot', count: 2 },
        { name: 'Pickle combinations', count: 1 }
    ];

    const products = [
        { id: 1, name: 'Magaya', subtitle: 'Sun dried Mango pickle', desc: 'An aromatic preparation that is an all time favourite of pickle lovers' },
        { id: 2, name: 'Magaya', subtitle: 'Sun dried Mango pickle', desc: 'An aromatic preparation that is an all time favourite of pickle lovers' },
        { id: 3, name: 'Magaya', subtitle: 'Sun dried Mango pickle', desc: 'An aromatic preparation that is an all time favourite of pickle lovers' },
        { id: 4, name: 'Magaya', subtitle: 'Sun dried Mango pickle', desc: 'An aromatic preparation that is an all time favourite of pickle lovers' },
        { id: 5, name: 'Magaya', subtitle: 'Sun dried Mango pickle', desc: 'An aromatic preparation that is an all time favourite of pickle lovers' },
        { id: 6, name: 'Magaya', subtitle: 'Sun dried Mango pickle', desc: 'An aromatic preparation that is an all time favourite of pickle lovers' }
    ];

    const steps = [
        { title: 'Source to Peak', desc: 'We select the finest fruits and vegetables at their nutritional peak from local organic farms.', icon: '/assets/icon_source_to_peak.png' },
        { title: 'Sun-Dry & Cure', desc: 'Traditional curing methods involve 72 hours of exposure to direct sunlight to ensure perfect texture.', icon: '/assets/icon_sun_dry_cure.png' },
        { title: 'Stone-Grind & Blend', desc: 'Spices are ground using traditional stone methods to release essential oils and intense flavor.', icon: '/assets/icon_stone_grind_blend.png' },
        { title: 'Land-Press & Seal', desc: 'Each batch is hand-pressed into glass jars and sealed with heritage techniques for freshness.', icon: '/assets/icon_press_and_seal.png' }
    ];

    return (
        <div className="min-h-screen bg-[#fcf9f4] font-sans text-[#3a2212]">
            <div className="max-w-[1440px] mx-auto">
                <div className="flex">
                    {/* Left Sidebar */}
                    <aside className="w-[300px] border-r border-[#3a2212]/5 pt-12 px-8 space-y-12 bg-white/20">
                        <div>
                            <h2 className="text-[20px] font-serif font-[700] mb-8">Categories</h2>
                            <div className="space-y-6">
                                {categories.map((cat, i) => (
                                    <div key={i} className="space-y-4">
                                        <div className="flex justify-between items-center group cursor-pointer">
                                            <span className={`text-[15px] font-[700] ${i === 0 ? 'text-[#3a2212]' : 'text-[#3a2212]/40'}`}>{cat.name}</span>
                                            <ChevronDown className={`w-4 h-4 ${i === 0 ? 'text-[#3a2212]' : 'text-[#3a2212]/20'}`} />
                                        </div>
                                        {cat.sub && i === 0 && (
                                            <div className="pl-2 space-y-3">
                                                {cat.sub.map((s, j) => (
                                                    <div key={j} className="text-[14px] text-[#3a2212]/30 font-[500] hover:text-[#bf8345] transition-colors cursor-pointer">{s}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h2 className="text-[18px] font-serif font-[700]">Filter By</h2>
                            <div className="space-y-4">
                                {filters.map((f, i) => (
                                    <div key={i} className="flex justify-between items-center group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded border border-[#3a2212]/20 group-hover:border-[#bf8345]" />
                                            <span className="text-[14px] font-[600] text-[#3a2212]/60 uppercase tracking-tighter">{f.name}</span>
                                        </div>
                                        <span className="text-[12px] text-[#3a2212]/20 font-[700]">{f.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-[14px] font-[800] uppercase tracking-widest opacity-30">Price Range</h2>
                            <div className="space-y-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                    className="w-full accent-[#bf8345] h-1 bg-[#3a2212]/5 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-[11px] font-[800] text-[#3a2212]/30">
                                    <span>Rs. 0</span>
                                    <span>Rs. 1000</span>
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

                    {/* Main Content Area */}
                    <main className="flex-1 p-12 space-y-16">
                        {/* Product Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {products.map((p, i) => (
                                <div key={i} className="bg-white rounded-[40px] overflow-hidden custom-shadow-md border border-black/5 group hover:custom-shadow-xl transition-all duration-500 h-[580px] flex flex-col relative">
                                    <div className="h-[40%] w-full overflow-hidden relative">
                                        <img src="/assets/image 53.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    </div>
                                    <div className="p-8 text-center flex-1 flex flex-col space-y-4">
                                        <div>
                                            <h3 className="text-[32px] font-sans font-[700] text-[#3a2212] leading-tight">{p.name}</h3>
                                            <p className="text-[14px] text-black/40 font-[500] italic">{p.subtitle}</p>
                                        </div>
                                        <p className="text-[13px] text-black/50 leading-relaxed font-[500] max-w-[220px] mx-auto">{p.desc}</p>

                                        <div className="flex justify-center gap-2 pt-2">
                                            <div className="flex items-center bg-white rounded-lg border border-black/5 h-[48px] px-1 group-hover:border-[#1ea731]/20 transition-colors">
                                                <button className="w-7 h-7 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-black/30">
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="px-4 text-[15px] font-[700] text-[#3a2212]">1</span>
                                                <button className="w-7 h-7 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-black/30">
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <button className="flex-1 py-3 bg-[#5cb85c] rounded-[10px] text-white text-[13px] font-[800] shadow-sm hover:bg-[#4cae4c] transition-colors">ADD TO CART</button>
                                        </div>

                                        <div className="flex justify-center gap-2">
                                            <button className="flex-1 py-1.5 border border-dashed border-black/10 rounded-[8px] text-[11px] font-[700] text-black/30">800/1kg</button>
                                            <button className="flex-1 py-1.5 border border-dashed border-black/10 rounded-[8px] text-[11px] font-[700] text-black/30">800/1kg</button>
                                            <button className="flex-1 py-1.5 bg-[#5cb85c] rounded-[8px] text-white text-[11px] font-[700] shadow-sm">800/1kg</button>
                                        </div>
                                    </div>
                                    <button className="absolute top-6 right-6 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-black/30 hover:text-red-500 transition-colors border border-black/5">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>

                {/* Process Section - "Four Steps. Zero Shortcuts." - Centered relative to 1440px container */}
                <section className="py-24 border-t border-black/5">
                    <div className="text-center space-y-4 mb-20">
                        <span className="text-[14px] font-[700] text-[#bf8345] uppercase tracking-[0.3em]">HOW WE DO IT</span>
                        <h2 className="text-[64px] font-serif font-[700] text-[#3a2212] leading-tight">Four Steps.<br /><span className="text-[#bf8345] italic font-[400]">Zero Shortcuts.</span></h2>
                        <p className="text-[16px] text-[#3a2212]/50 max-w-[500px] mx-auto font-[500] leading-relaxed">Every packet follows a sacred sequence — the samy one our founders and their bottled nostalgic small the heritage offer</p>
                    </div>

                    <div className="relative max-w-6xl mx-auto px-12">
                        {/* Connector Line */}
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
                    <div className="space-y-8">
                        <h4 className="text-[14px] font-[700] tracking-[0.2em] uppercase">SUPPORT</h4>
                        <ul className="space-y-4 text-[14px] text-white/50 font-[300]">
                            <li className="hover:text-white cursor-pointer transition-colors">Shipping Policy</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Refund Policy</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                        </ul>
                    </div>
                    <div className="space-y-8">
                        <h4 className="text-[14px] font-[700] tracking-[0.2em] uppercase">NEWSLETTER</h4>
                        <p className="text-[14px] text-white/50 font-[300]">Join our mailing list for updates and traditional recipes.</p>
                        <div className="flex border-b border-white/20 pb-2">
                            <input type="email" placeholder="Email Address" className="bg-transparent border-none outline-none text-[14px] flex-1 font-[300]" />
                            <button className="text-[20px]">→</button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
