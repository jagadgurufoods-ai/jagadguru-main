'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

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
    stock: number;
    variants?: Variant[];
}

function SearchResults() {
    const searchParams = useSearchParams();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            setLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products?search=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    setProducts(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [query]);

    return (
        <div className="max-w-[1440px] mx-auto px-6 py-12">
            <div className="mb-12">
                <h1 className="text-[32px] font-sans font-[700] text-[#000]">
                    Search Results for "{query}"
                </h1>
                <p className="text-black/40 mt-2">{products.length} products found</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bf8345]"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.length > 0 ? (
                        products.map((product) => {
                            const defaultVariant = product.variants?.find((v: Variant) => v.weight === '250g') || product.variants?.[0];
                            const currentPrice = defaultVariant ? Number(defaultVariant.price) : Number(product.price);
                            const currentStock = defaultVariant ? defaultVariant.stock : product.stock;
                            const isOutOfStock = currentStock <= 0;

                            return (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    className="bg-white rounded-[32px] overflow-hidden border border-black/5 hover:shadow-xl transition-all group flex flex-col h-full relative"
                                >
                                    <button
                                        className="absolute top-3 right-3 md:top-4 md:right-4 w-7 h-7 md:w-9 md:h-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center transition-all border border-black/5 z-20 group/heart"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleWishlist(product.id);
                                        }}
                                    >
                                        <Heart className={`w-3.5 h-3.5 md:w-5 md:h-5 transition-colors ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-black/30 group-hover/heart:text-red-400'}`} />
                                    </button>
                                    <div className="aspect-square w-full overflow-hidden relative">
                                        <img
                                            src={product.imageUrl || '/assets/image 53.png'}
                                            alt={product.name}
                                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                                        />
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                <span className="bg-white text-red-600 px-4 py-2 rounded-full font-black text-xs md:text-sm tracking-widest shadow-xl transform -rotate-12 border-2 border-red-600 uppercase">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-1 text-center">
                                        <h3 className="text-[18px] font-[700] text-black mb-2">{product.name}</h3>
                                        <p className="text-[14px] text-black/50 line-clamp-2 mb-4 flex-1 italic">
                                            {product.description || 'Premium quality Jagadguru product'}
                                        </p>
                                        <div className="mt-auto">
                                            <p className="text-[18px] font-[800] text-[#bf8345] mb-4">
                                                ₹{currentPrice.toFixed(0)}
                                                <span className="text-[12px] text-black/20 ml-1 font-normal">/ {defaultVariant?.weight || '250g'}</span>
                                            </p>
                                            <button
                                                disabled={isOutOfStock}
                                                className={`w-full py-3 rounded-xl text-[14px] font-[700] transition-colors ${isOutOfStock ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#bf8345] hover:bg-[#a6713a] text-white'}`}
                                            >
                                                {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-orange-100">
                            <p className="text-black/40 text-[18px]">We couldn't find any products matching your search.</p>
                            <Link href="/" className="inline-block mt-6 text-[#bf8345] font-[700] hover:underline">
                                Continue Shopping
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bf8345]"></div>
            </div>
        }>
            <SearchResults />
        </Suspense>
    );
}
