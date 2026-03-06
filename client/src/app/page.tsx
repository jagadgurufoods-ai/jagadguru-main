'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from './context/CartContext';
import { Check, X, Minus, Plus } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  grandmasSays?: string;
  tasteMeter?: number;
  stock: number;
}

interface HomeSection {
  id: number;
  title: string;
  slug: string;
  products: { product: Product }[];
}

export default function Home() {
  const [data, setData] = useState<{ sections: HomeSection[] }>({ sections: [] });
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [cartQuantities, setCartQuantities] = useState<Record<number, number>>({});
  const [toastProduct, setToastProduct] = useState<Product | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedWeights, setSelectedWeights] = useState<Record<number, string>>({});

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/cms/home`)
      .then(res => res.json())
      .then(data => {
        if (data && data.sections) {
          setData(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const categories = [
    { name: 'PICKLES', icon: '/assets/image 37.png', link: '/category/pickles' },
    { name: 'POWDERS & \nMASALAS', icon: '/assets/image 38.png', link: '/category/powders' },
    { name: 'SNACKS', icon: '/assets/image 38.png', link: '/category/snacks' },
    { name: 'PAPADS & \nFRYUMS', icon: '/assets/image 71.png', link: '/category/papads' },
    { name: 'PREMIX', icon: '/assets/image 72.png', link: '/category/premix' },
    { name: 'COMBOS', icon: '/assets/image 73.png', link: '/category/combos' },
  ];

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      stock: product.stock
    }, 1, selectedWeights[product.id] || '250g');
    setCartQuantities(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
    setToastProduct(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCardQuantityChange = (e: React.MouseEvent, product: Product, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    const currentQty = cartQuantities[product.id] || 1;
    const newQty = currentQty + delta;
    if (newQty < 1) {
      setCartQuantities(prev => {
        const updated = { ...prev };
        delete updated[product.id];
        return updated;
      });
      return;
    }
    setCartQuantities(prev => ({ ...prev, [product.id]: newQty }));
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      stock: product.stock
    }, newQty, selectedWeights[product.id] || '250g');
  };

  // Render a product card (same exact UI as before)
  const renderProductCard = (product: Product, sectionIdx: number) => {
    const isGreen = sectionIdx === 0; // First section (Best Sellers) uses green, rest use orange
    const accentColor = isGreen ? '#15a31a' : '#bf8345';
    const hoverColor = isGreen ? '#128a16' : '#a6713a';
    const shadowColor = isGreen ? 'shadow-green-200' : 'shadow-orange-100';
    const shadowLgColor = isGreen ? 'shadow-green-100' : 'shadow-orange-50';
    const borderColor = isGreen ? 'border-[#15a31a]/40' : 'border-[#bf8345]/40';

    const currentWeight = selectedWeights[product.id] || '250g';

    const handleWeightClick = (e: React.MouseEvent, w: string) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedWeights(prev => ({ ...prev, [product.id]: w }));
    };

    return (
      <Link key={product.id} href={`/product/${product.id}`} className="bg-white rounded-[32px] md:rounded-[40px] overflow-hidden custom-shadow-md border border-black/5 group hover:custom-shadow-lg transition-all duration-300 flex flex-col min-h-[420px] md:h-[580px]">
        <div className="h-[200px] md:h-[40%] w-full overflow-hidden">
          <img src={product.imageUrl || '/assets/image 53.png'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="px-6 md:px-8 pb-6 md:pb-8 pt-6 md:pt-8 text-center space-y-4 flex-1 flex flex-col">
          <div>
            <h3 className="text-[28px] md:text-[36px] font-sans font-[700] text-[#000] leading-tight">{product.name}</h3>
            <p className="text-[12px] md:text-[14px] text-black/40 font-[500] italic">{product.description || 'Premium quality product'}</p>
          </div>
          <p className="text-[12px] md:text-[13px] text-black/50 leading-relaxed font-[500] max-w-[240px] mx-auto hidden md:block">{product.grandmasSays || product.description || 'An aromatic preparation that is an all time favourite'}</p>
          <div className="flex justify-center gap-2 pt-2 md:pt-4">
            <button
              onClick={(e) => handleWeightClick(e, '250g')}
              className={`flex-1 py-2 md:py-3 border-[1.5px] rounded-[10px] md:rounded-[12px] text-[10px] md:text-[12px] font-[700] transition-all ${currentWeight === '250g' ? 'bg-[#3a2212] border-[#3a2212] text-white' : 'border-dashed ' + borderColor + ' text-[#3a2212]/70 bg-black/[0.02]'}`}
            >₹{Number(product.price).toFixed(0)}/250g</button>
            <button
              onClick={(e) => handleWeightClick(e, '500g')}
              className={`flex-1 py-2 md:py-3 border-[1.5px] rounded-[10px] md:rounded-[12px] text-[10px] md:text-[12px] font-[700] transition-all ${currentWeight === '500g' ? 'bg-[#3a2212] border-[#3a2212] text-white' : 'border-dashed ' + borderColor + ' text-[#3a2212]/70 bg-black/[0.02]'}`}
            >₹{(Number(product.price) * 2).toFixed(0)}/500g</button>
            <button
              onClick={(e) => handleWeightClick(e, '1KG')}
              className={`flex-1 py-2 md:py-3 border-[1.5px] rounded-[10px] md:rounded-[12px] text-[10px] md:text-[12px] font-[700] transition-all ${currentWeight === '1KG' ? 'bg-[#3a2212] border-[#3a2212] text-white' : 'border-dashed ' + borderColor + ' text-[#3a2212]/70 bg-black/[0.02]'}`}
            >₹{(Number(product.price) * 3.5).toFixed(0)}/1kg</button>
          </div>
          {cartQuantities[product.id] ? (
            <div className="mt-auto flex items-center justify-center pt-4">
              <div className="flex items-center bg-white rounded-full border-2 border-[#15a31a] h-[48px] md:h-[56px] px-2 md:px-3 gap-1">
                <button
                  onClick={(e) => handleCardQuantityChange(e, product, -1)}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-[#15a31a]/10 rounded-full transition-colors text-[#15a31a] text-[18px] md:text-[24px] font-[700]"
                >
                  −
                </button>
                <span className="px-4 md:px-6 text-[16px] md:text-[20px] font-[800] text-[#3a2212] min-w-[30px] md:min-w-[40px] text-center">{cartQuantities[product.id]}</span>
                <button
                  onClick={(e) => handleCardQuantityChange(e, product, 1)}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-[#15a31a]/10 rounded-full transition-colors text-[#15a31a] text-[18px] md:text-[24px] font-[700]"
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => handleAddToCart(e, product)}
              className={`w-full mt-auto py-4 md:py-5 rounded-[12px] md:rounded-[16px] text-white text-[14px] md:text-[16px] font-[800] tracking-[0.02em] uppercase transition-colors shadow-lg ${shadowLgColor}`}
              style={{ backgroundColor: accentColor }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverColor)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = accentColor)}
            >
              ADD TO CART
            </button>
          )}
        </div>
      </Link>
    );
  };

  // Fallback hardcoded cards if no CMS data
  const renderFallbackCard = (i: number, isGreen: boolean) => {
    const accentColor = isGreen ? '#15a31a' : '#bf8345';
    const hoverColor = isGreen ? '#128a16' : '#a6713a';
    const borderColor = isGreen ? 'border-[#15a31a]/40' : 'border-[#bf8345]/40';
    const shadowColor = isGreen ? 'shadow-green-200' : 'shadow-orange-100';
    const shadowLgColor = isGreen ? 'shadow-green-100' : 'shadow-orange-50';

    return (
      <Link key={i} href="/product/1" className="bg-white rounded-[32px] md:rounded-[40px] overflow-hidden custom-shadow-md border border-black/5 group hover:custom-shadow-lg transition-all duration-300 flex flex-col min-h-[500px] md:h-[580px]">
        <div className="h-[200px] md:h-[40%] w-full overflow-hidden">
          <img src="/assets/image 53.png" alt="Magaya" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="px-6 md:px-8 pb-6 md:pb-8 pt-6 md:pt-8 text-center space-y-4 flex-1 flex flex-col">
          <div>
            <h3 className="text-[28px] md:text-[36px] font-sans font-[700] text-[#000] leading-tight">Magaya</h3>
            <p className="text-[12px] md:text-[14px] text-black/40 font-[500] italic">Sun dried Mango pickle</p>
          </div>
          <p className="text-[12px] md:text-[13px] text-black/50 leading-relaxed font-[500] max-w-[240px] mx-auto hidden md:block">An aromatic preparation that is an all time favourite of pickle lovers</p>
          <div className="flex justify-center gap-2 pt-2 md:pt-4">
            <button className={`flex-1 py-2 md:py-3 border-[1.5px] border-dashed ${borderColor} rounded-[10px] md:rounded-[12px] text-[10px] md:text-[12px] font-[700] text-[#3a2212]/70 bg-black/5`}>800/1kg</button>
            <button className={`flex-1 py-2 md:py-3 border-[1.5px] border-dashed ${borderColor} rounded-[10px] md:rounded-[12px] text-[10px] md:text-[12px] font-[700] text-[#3a2212]/70 bg-black/5`}>800/1kg</button>
            <button className={`flex-1 py-2 md:py-3 rounded-[10px] md:rounded-[12px] text-[10px] md:text-[12px] font-[700] text-white ${shadowColor}`} style={{ backgroundColor: accentColor }}>800/1kg</button>
          </div>
          <button
            className={`w-full mt-auto py-4 md:py-5 rounded-[12px] md:rounded-[16px] text-white text-[14px] md:text-[16px] font-[800] tracking-[0.02em] uppercase transition-colors shadow-lg ${shadowLgColor}`}
            style={{ backgroundColor: accentColor }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = accentColor)}
          >
            ADD TO CART
          </button>
        </div>
      </Link>
    );
  };

  return (
    <div className="w-full flex flex-col relative overflow-x-hidden">
      {/* Toast Notification */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-black/5 px-6 py-4 min-w-[320px]">
          <div className="w-10 h-10 rounded-full bg-[#15a31a] flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-[700] text-[#3a2212]">Added to Cart!</p>
            <p className="text-[12px] text-black/40 font-[500]">{toastProduct?.name}</p>
          </div>
          <button onClick={() => setShowToast(false)} className="text-black/20 hover:text-black/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Section - Desktop Only */}
      <section className="relative w-full h-[calc(100vh-90px)] min-h-[600px] overflow-hidden hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/image 65.png')" }}
        />
        <div className="absolute bottom-0 left-0 w-full bg-[#bf8345] z-20">
          <div className="max-w-[1440px] mx-auto grid grid-cols-6 h-[100px]">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                href={cat.link}
                className={`flex items-center justify-center gap-4 px-6 hover:bg-black/5 transition-colors ${idx !== categories.length - 1 ? 'dashed-border-r' : ''}`}
              >
                <img src={cat.icon} alt="" className="w-12 h-12 object-contain brightness-110" />
                <span className="text-white text-[13px] font-[700] tracking-[0.05em] leading-[1.2] uppercase whitespace-pre-line">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Hero & Categories Overlap Section */}
      <section className="lg:hidden relative w-full bg-[#fdfaf5]">
        {/* Banner Area */}
        <div className="relative h-[65vh] min-h-[500px] w-full">
          <img
            src="/assets/image 65.png"
            alt="Jagadguru Heritage"
            className="w-full h-full object-cover brightness-[0.9]"
          />
          {/* Banner Content Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex flex-col justify-center px-10 pb-32">
            <h1 className="text-white text-[32px] md:text-[40px] font-serif font-[700] leading-[1.1] mb-6 drop-shadow-lg">
              Authentic Delights,<br />
              <span className="italic font-[400]">A Tangy Heritage</span>
            </h1>
            <button className="w-fit bg-[#28a745] hover:bg-[#218838] text-white px-8 py-3 rounded-[12px] font-[800] text-[14px] uppercase tracking-[0.1em] transition-all active:scale-95 shadow-lg">
              Explore
            </button>

            {/* Carousel Dots */}
            <div className="flex gap-2 mt-8">
              <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
            </div>
          </div>
        </div>

        {/* Floating Category Card - Overlapping the Banner */}
        <div className="px-6 -mt-32 relative z-10 pb-12">
          <div className="bg-white rounded-[24px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border border-black/5 p-8">
            <div className="grid grid-cols-3 gap-y-10 gap-x-4">
              {categories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={cat.link}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className="w-[60px] h-[60px] flex items-center justify-center transition-transform group-active:scale-90">
                    <img
                      src={cat.icon}
                      alt={cat.name}
                      className="w-full h-full object-contain filter drop-shadow-sm"
                    />
                  </div>
                  <span className="text-[11px] font-[800] text-[#3a2212] text-center tracking-tighter leading-tight uppercase opacity-80">
                    {cat.name.replace('\n', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Top Picks Header (Optional but matches the mockup vibe) */}
      <div className="lg:hidden px-6 pt-4 pb-0">
        <h2 className="text-[32px] font-serif font-[700] text-[#3a2212] tracking-tight">top picks</h2>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-6 py-12 md:py-20 space-y-16 md:space-y-24">
        {/* Render CMS sections or fallback */}
        {data.sections.length > 0 ? (
          data.sections.map((section, sectionIdx) => (
            <section key={section.id} className="space-y-8 md:space-y-12">
              <div className="flex items-center gap-4 md:gap-6">
                <h2 className="text-[24px] md:text-[32px] font-sans font-[700] text-[#000] whitespace-nowrap">{section.title}</h2>
                <div className="h-[2px] w-full bg-[#bf8345] opacity-80" />
              </div>

              <div className={sectionIdx === 1 ? 'relative' : ''}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  {section.products.map((p) => renderProductCard(p.product, sectionIdx))}
                </div>
              </div>
            </section>
          ))
        ) : (
          <>
            {/* Best Sellers Section - Fallback */}
            <section className="space-y-8 md:space-y-12">
              <div className="flex items-center gap-4 md:gap-6">
                <h2 className="text-[24px] md:text-[32px] font-sans font-[700] text-[#000] whitespace-nowrap">Best Sellers</h2>
                <div className="h-[2px] w-full bg-[#bf8345] opacity-80" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {[1, 2, 3, 4].map((i) => renderFallbackCard(i, true))}
              </div>
            </section>
          </>
        )}

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 py-10 border-t border-[#3a2212]/5">
          <div className="text-center space-y-3 md:space-y-4">
            <div className="flex justify-center">
              <img src="/assets/Icon (1).png" alt="" className="h-8 md:h-10 w-auto" />
            </div>
            <h4 className="text-[14px] md:text-[16px] font-[700] text-[#3a2212] uppercase tracking-[0.1em]">100% Organic</h4>
            <p className="text-[12px] md:text-[13px] text-black/50 leading-relaxed max-w-[280px] mx-auto">Made from freshly picked organic mangoes and spices.</p>
          </div>
          <div className="text-center space-y-3 md:space-y-4">
            <div className="flex justify-center">
              <img src="/assets/Icon (2).png" alt="" className="h-8 md:h-10 w-auto" />
            </div>
            <h4 className="text-[14px] md:text-[16px] font-[700] text-[#3a2212] uppercase tracking-[0.1em]">Handmade with Love</h4>
            <p className="text-[12px] md:text-[13px] text-black/50 leading-relaxed max-w-[280px] mx-auto">Traditional methods passed down through generations.</p>
          </div>
          <div className="text-center space-y-3 md:space-y-4">
            <div className="flex justify-center">
              <img src="/assets/Icon (3).png" alt="" className="h-8 md:h-10 w-auto" />
            </div>
            <h4 className="text-[14px] md:text-[16px] font-[700] text-[#3a2212] uppercase tracking-[0.1em]">Guaranteed Quality</h4>
            <p className="text-[12px] md:text-[13px] text-black/50 leading-relaxed max-w-[280px] mx-auto">Rigorous quality checks for every single bottle.</p>
          </div>
        </section>
      </div>

      {/* Heritage Story Section */}
      <section className="relative w-full aspect-video md:aspect-[21/9] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[0.85]"
          style={{ backgroundImage: "url('/assets/image 65.png')" }}
        />
        <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2">
          <div className="space-y-4 md:space-y-8 p-6 md:p-10 rounded-2xl bg-black/10 backdrop-blur-[2px] lg:bg-transparent lg:backdrop-blur-0">
            <div className="space-y-1 md:space-y-2">
              <span className="text-white text-[12px] md:text-[14px] font-[700] tracking-[0.3em] uppercase opacity-80">OUR LEGACY</span>
              <h2 className="text-[32px] md:text-[64px] font-serif font-[700] text-white leading-tight md:leading-[1.1]">Our Heritage Story</h2>
            </div>
            <div className="space-y-4 md:space-y-6 text-white/90 text-[14px] md:text-[18px] leading-relaxed max-w-[600px] font-[300]">
              <p>Jagadguru Foods began in a <strong>small family kitchen</strong> in the heart of Andhra. For three generations, we have preserved the flavors of South Indian heritage.</p>
              <p className="hidden md:block">Every jar of pickle and every packet of spice reflects our commitment to purity, traditional methods, and the soulful taste of home-cooked food.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="w-full bg-[#fdfaf5] py-12 md:py-24 space-y-8 md:space-y-16">
        <h2 className="text-center text-[24px] md:text-[32px] font-serif font-[700] text-[#3a2212]">Our Certifications</h2>
        <div className="max-w-[1440px] mx-auto px-6 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
          <img src="/assets/image (2) 1.png" alt="FSSAI" className="h-[30px] md:h-[50px] w-auto" />
          <img src="/assets/image 71.png" alt="Jaivik Bharat" className="h-[40px] md:h-[70px] w-auto" />
          <img src="/assets/image 72.png" alt="India Organic" className="h-[40px] md:h-[70px] w-auto" />
          <img src="/assets/image 73.png" alt="USDA Organic" className="h-[50px] md:h-[80px] w-auto" />
          <img src="/assets/image 74.png" alt="Other" className="h-[50px] md:h-[80px] w-auto" />
          <img src="/assets/Group 1000001883.png" alt="Ecocert" className="h-[50px] md:h-[80px] w-auto" />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#1a1a1a] text-white py-12 md:py-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16">
          <div className="space-y-6 md:space-y-8 col-span-1 border-b border-white/10 pb-12 md:border-none md:pb-0">
            <img src="/assets/logo.png" alt="Jagadguru Foods" className="h-[60px] md:h-[80px] w-auto brightness-0 invert" />
            <p className="text-[14px] text-white/60 leading-relaxed font-[300]">Authentic South Indian pickles and powders made with traditional recipes and love.</p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">f</div>
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">i</div>
            </div>
          </div>
          <div className="space-y-6 md:space-y-8">
            <h4 className="text-[14px] font-[700] tracking-[0.2em] uppercase">QUICK LINKS</h4>
            <ul className="space-y-3 md:space-y-4 text-[14px] text-white/50 font-[300]">
              <li className="hover:text-white cursor-pointer transition-colors">Our Story</li>
              <li className="hover:text-white cursor-pointer transition-colors">All Products</li>
              <li className="hover:text-white cursor-pointer transition-colors">Bulk Orders</li>
              <li className="hover:text-white cursor-pointer transition-colors">Contact Us</li>
            </ul>
          </div>
          <div className="space-y-6 md:space-y-8">
            <h4 className="text-[14px] font-[700] tracking-[0.2em] uppercase">SUPPORT</h4>
            <ul className="space-y-3 md:space-y-4 text-[14px] text-white/50 font-[300]">
              <li className="hover:text-white cursor-pointer transition-colors">Shipping Policy</li>
              <li className="hover:text-white cursor-pointer transition-colors">Refund Policy</li>
              <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
            </ul>
          </div>
          <div className="space-y-6 md:space-y-8">
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
