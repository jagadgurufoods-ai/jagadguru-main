'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Category {
    id: number;
    title: string;
}

interface ProductFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export default function ProductForm({ onClose, onSuccess, initialData }: ProductFormProps) {
    const { token } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price?.toString() || '',
        stock: initialData?.stock?.toString() || '',
        categoryId: initialData?.categoryId?.toString() || '',
        grandmasSays: initialData?.grandmasSays || '',
        ingredients: initialData?.ingredients || '',
        tasteMeter: initialData?.tasteMeter?.toString() || '3'
    });

    const [variants, setVariants] = useState(
        initialData?.variants?.length > 0
            ? initialData.variants.map((v: any) => ({ weight: v.weight, price: v.price.toString(), stock: v.stock.toString() }))
            : [
                { weight: '250g', price: '', stock: '' },
                { weight: '500g', price: '', stock: '' },
                { weight: '1KG', price: '', stock: '' }
            ]
    );

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/categories`)
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error('Failed to fetch categories:', err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVariantChange = (index: number, field: string, value: string) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value) data.append(key, value);
        });
        if (image) {
            data.append('image', image);
        }

        // Add variants
        const filteredVariants = variants.filter((v: any) => v.price && v.stock);
        data.append('variants', JSON.stringify(filteredVariants));

        try {
            const url = initialData
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products/${initialData.id}`
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products`;

            const response = await fetch(url, {
                method: initialData ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save product');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-8 space-y-8">
                    <div className="flex justify-between items-center bg-slate-50 -m-8 p-8 mb-4 border-b border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {initialData ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
                        </h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-2">✕</button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-medium text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Classic Mango Avakaya"
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500 transition-all font-medium text-slate-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            <select
                                required
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500 transition-all font-medium text-slate-900 appearance-none"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Overall Stock (Total)</label>
                            <input
                                required
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="100"
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500 transition-all font-medium text-slate-900"
                            />
                        </div>

                        <div className="md:col-span-2 p-6 bg-slate-50 rounded-3xl space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Pricing & Stock by Weight</h3>
                            <div className="space-y-4">
                                {variants.map((v: any, i: number) => (
                                    <div key={i} className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <input
                                                value={v.weight}
                                                onChange={(e) => handleVariantChange(i, 'weight', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold"
                                                placeholder="Label"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <input
                                                type="number"
                                                value={v.price}
                                                onChange={(e) => handleVariantChange(i, 'price', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm"
                                                placeholder="Price (₹)"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <input
                                                type="number"
                                                value={v.stock}
                                                onChange={(e) => handleVariantChange(i, 'stock', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm"
                                                placeholder="Stock"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Heat Level (1-5)</label>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4, 5].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, tasteMeter: level.toString() })}
                                        className={`w-10 h-10 rounded-full font-bold transition-all ${formData.tasteMeter === level.toString() ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500 transition-all font-medium text-slate-900"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Grandma Says (Heritage Quote)</label>
                            <textarea
                                name="grandmasSays"
                                value={formData.grandmasSays}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Ancient wisdom about this recipe..."
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500 transition-all font-medium text-slate-900 italic"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Product Image</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer group-hover:bg-slate-100 group-hover:border-green-400 transition-all font-bold text-slate-400"
                                >
                                    {image ? image.name : initialData?.imageUrl ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg hover:bg-green-600 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200"
                            >
                                {loading ? 'SAVING...' : initialData ? 'UPDATE PRODUCT' : 'PUBLISH PRODUCT'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
