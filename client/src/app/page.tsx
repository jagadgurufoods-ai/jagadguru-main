'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from './context/CartContext';
import { useWishlist } from './context/WishlistContext';
import { Check, X, Minus, Plus, Heart } from 'lucide-react';

interface Variant {
  id: number;
  weight: string;
  price: number;
  stock: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  grandmasSays?: string;
  tasteMeter?: number;
  stock: number;
  variants?: Variant[];
}

interface Banner {
  id: number;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  displayOrder?: number;
}

interface HomeSection {
  id: number;
  title: string;
  slug: string;
  products: { product: Product }[];
}

interface HomeData {
  banners: Banner[];
  sections: HomeSection[];
}

export default function Home() {
  const [data, setData] = useState<HomeData>({ banners: [], sections: [] });
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [cartQuantities, setCartQuantities] = useState<Record<number, number>>({});
  const [toastProduct, setToastProduct] = useState<Product | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedWeights, setSelectedWeights] = useState<Record<number, string>>({});
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

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

  useEffect(() => {
    if (data.banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % data.banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [data.banners.length]);

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
    const currentVariant = product.variants?.find((v: Variant) => v.weight === currentWeight);
    const isOutOfStock = currentVariant ? currentVariant.stock <= 0 : product.stock <= 0;
    const isWishlisted = isInWishlist(product.id);

    const handleWeightClick = (e: React.MouseEvent, w: string) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedWeights(prev => ({ ...prev, [product.id]: w }));
    };

    const renderVariantButton = (weight: string) => {
      const variant = product.variants?.find((v: Variant) => v.weight === weight);
      const price = variant ? Number(variant.price) : (weight === '250g' ? Number(product.price) : weight === '500g' ? Number(product.price) * 2 : Number(product.price) * 3.5);
      const isSelected = currentWeight === weight;

      return (
        <button
          onClick={(e) => handleWeightClick(e, weight)}
          className={`flex items-center justify-center border-[1px] rounded-[8px] md:rounded-[10px] text-[9px] md:text-[11px] font-[700] transition-all whitespace-nowrap px-1 ${isSelected ? 'bg-[#3a2212] border-[#3a2212] text-white' : 'border-dashed ' + borderColor + ' text-[#3a2212]/70 bg-black/[0.02]'}`}
        >
          ₹{price.toFixed(0)}/{weight}
        </button>
      );
    };

    return (
      <div key={product.id} className="bg-white rounded-[24px] md:rounded-[32px] overflow-hidden custom-shadow-md border border-black/5 group hover:custom-shadow-lg transition-all duration-300 flex flex-col h-[400px] md:h-[440px] w-full flex-shrink-0 relative">
        <button
          className="absolute top-3 right-3 md:top-4 md:right-4 w-7 h-7 md:w-8 md:h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center transition-all border border-black/5 z-30 group/heart"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
        >
          <Heart className={`w-3.5 h-3.5 md:w-4.5 md:h-4.5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-black/30 group-hover/heart:text-red-400'}`} />
        </button>
        <Link href={`/product/${product.id}`} className="h-[140px] md:h-[160px] w-full overflow-hidden flex-shrink-0 bg-black/[0.03] relative block">
          <img
            src={product.imageUrl || '/assets/image 53.png'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/image 53.png'; }}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-white text-red-600 px-4 py-2 rounded-full font-black text-xs md:text-sm tracking-widest shadow-xl transform -rotate-12 border-2 border-red-600 uppercase">
                Out of Stock
              </span>
            </div>
          )}
        </Link>
        <div className="px-4 md:px-6 pb-4 pt-4 text-center flex-1 flex flex-col overflow-hidden">
          <Link href={`/product/${product.id}`} className="flex flex-col flex-shrink-0">
            <div className="h-[44px] md:h-[52px] flex flex-col justify-center">
              <h3 className="text-[14px] md:text-[18px] font-sans font-[700] text-[#000] leading-[1.2] line-clamp-1 group-hover:text-[#bf8345] transition-colors uppercase tracking-tight">{product.name}</h3>
              <p className="text-[10px] md:text-[12px] text-black/50 font-[500] italic line-clamp-2 mt-1 leading-relaxed min-h-[32px]">
                {product.grandmasSays || product.description || 'Authentic heritage flavors passed down through generations'}
              </p>
            </div>
          </Link>
          <div className="h-[34px] md:h-[42px] grid grid-cols-3 gap-1 md:gap-1.5 flex-shrink-0 my-3 relative z-30">
            {renderVariantButton('250g')}
            {renderVariantButton('500g')}
            {renderVariantButton('1KG')}
          </div>
          {cartQuantities[product.id] ? (
            <div className="mt-auto flex items-center justify-center h-[38px] md:h-[46px] flex-shrink-0 relative z-30" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between bg-white rounded-xl border-2 border-[#15a31a] h-full px-1 gap-1 w-full max-w-[120px] md:max-w-[150px] mx-auto">
                <button
                  onClick={(e) => handleCardQuantityChange(e, product, -1)}
                  className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-[#15a31a]/10 rounded-full transition-colors text-[#15a31a] font-[700]"
                >
                  <Minus className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#15a31a]" />
                </button>
                <span className="text-[14px] md:text-[15px] font-[800] text-[#3a2212] min-w-[20px] text-center font-sans">{cartQuantities[product.id]}</span>
                <button
                  disabled={isOutOfStock}
                  onClick={(e) => handleCardQuantityChange(e, product, 1)}
                  className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full transition-colors text-[#15a31a] font-[700] ${isOutOfStock ? 'opacity-30' : 'hover:bg-[#15a31a]/10'}`}
                >
                  <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#15a31a]" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => handleAddToCart(e, product)}
              disabled={isOutOfStock}
              className={`w-full mt-auto h-[38px] md:h-[46px] flex items-center justify-center rounded-[10px] md:rounded-[12px] text-white text-[11px] md:text-[13px] font-[800] tracking-[0.02em] uppercase transition-all shadow-md ${shadowLgColor} relative z-30 active:scale-[0.98] ${isOutOfStock ? 'grayscale opacity-50 cursor-not-allowed shadow-none' : ''}`}
              style={{ backgroundColor: isOutOfStock ? '#ccc' : accentColor }}
              onMouseEnter={(e) => !isOutOfStock && (e.currentTarget.style.backgroundColor = hoverColor)}
              onMouseLeave={(e) => !isOutOfStock && (e.currentTarget.style.backgroundColor = accentColor)}
            >
              {isOutOfStock ? 'NO STOCK' : 'ADD TO CART'}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render a skeleton loading card
  const renderSkeletonCard = (i: number) => {
    return (
      <div key={i} className="bg-white rounded-[24px] md:rounded-[32px] overflow-hidden custom-shadow-md border border-black/5 flex flex-col h-[390px] md:h-[430px] w-full flex-shrink-0 relative">
        <div className="absolute top-3 right-3 md:top-4 md:right-4 w-7 h-7 md:w-8 md:h-8 bg-black/[0.03] rounded-full animate-pulse z-30" />
        <div className="h-[140px] md:h-[160px] w-full bg-black/[0.05] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
        <div className="px-4 md:px-6 pb-4 pt-4 md:pt-5 text-center flex-1 flex flex-col overflow-hidden">
          <div className="h-[44px] md:h-[52px] flex flex-col justify-center items-center">
            <div className="h-4 w-3/4 bg-black/[0.05] rounded-md animate-pulse mb-2" />
            <div className="h-2.5 w-1/2 bg-black/[0.05] rounded-md animate-pulse" />
          </div>
          <div className="h-[36px] md:h-[44px] grid grid-cols-3 gap-1 md:gap-1.5 mb-3">
            {[1, 2, 3].map(j => <div key={j} className="h-full bg-black/[0.03] rounded-[8px] animate-pulse" />)}
          </div>
          <div className="mt-auto h-[38px] md:h-[46px] w-full bg-black/[0.05] rounded-[10px] md:rounded-[12px] animate-pulse" />
        </div>
      </div>
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
      <div key={i} className="bg-white rounded-[32px] md:rounded-[40px] overflow-hidden custom-shadow-md border border-black/5 group hover:custom-shadow-lg transition-all duration-300 flex flex-col h-[440px] md:h-[480px] w-full flex-shrink-0 relative">
        <button
          className="absolute top-3 right-3 md:top-4 md:right-4 w-7 h-7 md:w-9 md:h-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center transition-all border border-black/5 z-20 group/heart"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(i);
          }}
        >
          <Heart className={`w-3.5 h-3.5 md:w-5 md:h-5 transition-colors ${isInWishlist(i) ? 'fill-red-500 text-red-500' : 'text-black/30 group-hover/heart:text-red-400'}`} />
        </button>
        <Link href="/product/1" className="h-[160px] md:h-[180px] w-full overflow-hidden flex-shrink-0 bg-black/[0.03] relative block">
          <img
            src="/assets/image 53.png"
            alt="Magaya"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/image 53.png'; }}
          />
        </Link>
        <div className="px-5 md:px-8 pb-4 md:pb-6 pt-4 md:pt-6 text-center flex-1 flex flex-col overflow-hidden">
          <Link href="/product/1" className="flex flex-col flex-shrink-0">
            <div className="h-[52px] md:h-[64px] flex flex-col justify-center">
              <h3 className="text-[15px] md:text-[18px] font-sans font-[700] text-[#000] leading-tight line-clamp-1 group-hover:text-[#bf8345] transition-colors">Magaya</h3>
              <p className="text-[10px] md:text-[12px] text-black/40 font-[500] italic line-clamp-1 mt-0.5">Sun dried Mango pickle</p>
            </div>
            <div className="h-[32px] md:h-[40px] flex items-center justify-center mb-2">
              <p className="text-[10px] md:text-[12px] text-black/50 leading-relaxed font-[500] max-w-[240px] line-clamp-2">An aromatic preparation that is an all time favourite of pickle lovers</p>
            </div>
          </Link>
          <div className="h-[40px] md:h-[50px] grid grid-cols-3 gap-1.5 md:gap-2 items-center flex-shrink-0 mb-3 relative z-10">
            <button className={`py-1.5 md:py-2.5 border-[1px] border-dashed ${borderColor} rounded-[8px] md:rounded-[10px] text-[9px] md:text-[11px] font-[700] text-[#3a2212]/70 bg-black/5`}>800/1kg</button>
            <button className={`py-1.5 md:py-2.5 border-[1px] border-dashed ${borderColor} rounded-[8px] md:rounded-[10px] text-[9px] md:text-[11px] font-[700] text-[#3a2212]/70 bg-black/5`}>800/1kg</button>
            <button className={`py-1.5 md:py-2.5 rounded-[8px] md:rounded-[10px] text-[9px] md:text-[11px] font-[700] text-white ${shadowColor}`} style={{ backgroundColor: accentColor }}>800/1kg</button>
          </div>
          <button
            className={`w-full mt-auto py-3 md:py-4 rounded-[12px] md:rounded-[16px] text-white text-[13px] md:text-[14px] font-[800] tracking-[0.02em] uppercase transition-colors shadow-lg ${shadowLgColor} relative z-10`}
            style={{ backgroundColor: accentColor }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = accentColor)}
          >
            ADD TO CART
          </button>
        </div>
      </div>
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
        {data.banners.length > 0 ? (
          data.banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentBannerIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${banner.imageUrl}')` }}
              />
              <div className="absolute inset-0 bg-black/20 flex flex-col justify-center px-24">
                <div className="max-w-[1440px] mx-auto w-full">
                  {banner.subtitle && <p className="text-white text-[20px] font-serif italic mb-2 drop-shadow-lg">{banner.subtitle}</p>}
                  {banner.title && <h1 className="text-white text-[64px] font-serif font-[700] leading-[1.1] mb-8 drop-shadow-lg max-w-2xl">{banner.title}</h1>}
                  {banner.ctaText && (
                    <Link href={banner.ctaLink || '#'} className="bg-[#28a745] hover:bg-[#218838] text-white px-10 py-4 rounded-[12px] font-[800] text-[16px] uppercase tracking-[0.1em] transition-all active:scale-95 shadow-xl w-fit inline-block">
                      {banner.ctaText}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/image 65.png')" }}
          />
        )}

        {data.banners.length > 1 && (
          <div className="absolute bottom-[130px] left-24 flex gap-3 z-30">
            {data.banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBannerIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${idx === currentBannerIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
              />
            ))}
          </div>
        )}

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
          {data.banners.length > 0 ? (
            data.banners.map((banner, idx) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentBannerIndex ? 'opacity-100' : 'opacity-0'}`}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title || 'Hero'}
                  className="w-full h-full object-cover brightness-[0.9]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-center px-10 pb-32">
                  {banner.subtitle && <p className="text-white text-[16px] font-serif italic mb-2 drop-shadow-md">{banner.subtitle}</p>}
                  {banner.title && <h1 className="text-white text-[32px] md:text-[40px] font-serif font-[700] leading-[1.1] mb-6 drop-shadow-lg">{banner.title}</h1>}
                  {banner.ctaText && (
                    <Link href={banner.ctaLink || '#'} className="w-fit bg-[#28a745] hover:bg-[#218838] text-white px-8 py-3 rounded-[12px] font-[800] text-[14px] uppercase tracking-[0.1em] transition-all active:scale-95 shadow-lg">
                      {banner.ctaText}
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <>
              <img
                src="/assets/image 65.png"
                alt="Jagadguru Heritage"
                className="w-full h-full object-cover brightness-[0.9]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex flex-col justify-center px-10 pb-32">
                <h1 className="text-white text-[32px] md:text-[40px] font-serif font-[700] leading-[1.1] mb-6 drop-shadow-lg">
                  Authentic Delights,<br />
                  <span className="italic font-[400]">A Tangy Heritage</span>
                </h1>
                <button className="w-fit bg-[#28a745] hover:bg-[#218838] text-white px-8 py-3 rounded-[12px] font-[800] text-[14px] uppercase tracking-[0.1em] transition-all active:scale-95 shadow-lg">
                  Explore
                </button>
              </div>
            </>
          )}

          {/* Carousel Dots */}
          {data.banners.length > 1 && (
            <div className="absolute bottom-[140px] left-10 flex gap-2 z-10">
              {data.banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBannerIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentBannerIndex ? 'bg-white scale-110' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
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


      {/* Main Content Sections */}
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-6 py-12 md:py-20 space-y-16 md:space-y-24">
        {loading ? (
          <section className="space-y-8 md:space-y-12">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="h-8 w-48 bg-black/[0.05] rounded-lg animate-pulse" />
              <div className="h-[2px] w-full bg-black/[0.05]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[1, 2, 3, 4].map((i) => renderSkeletonCard(i))}
            </div>
          </section>
        ) : data.sections.length > 0 ? (
          data.sections.filter(s => s.products.length > 0).map((section, sectionIdx) => (
            <section key={section.id} className="space-y-6 md:space-y-10">
              <div className="flex items-center gap-4 md:gap-6">
                <h2 className="text-[20px] md:text-[28px] font-sans font-[700] text-[#000] whitespace-nowrap uppercase tracking-wider">{section.title}</h2>
                <div className="h-[1px] w-full bg-[#bf8345]/30" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {section.products.map((p) => renderProductCard(p.product, sectionIdx))}
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
