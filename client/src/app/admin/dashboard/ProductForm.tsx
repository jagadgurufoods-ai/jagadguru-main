'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProductIngredientEditor from '../../components/map/ProductIngredientEditor';
import { X, Search } from 'lucide-react';

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
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price?.toString() || '',
        stock: initialData?.stock?.toString() || '',
        categoryId: initialData?.categoryId?.toString() || '',
        grandmasSays: initialData?.grandmasSays || '',
        pairsWellWith: initialData?.pairsWellWith || '',
        ingredientsText: initialData?.ingredientsText || '',
        tasteMeter: initialData?.tasteMeter?.toString() || '3',
        spiceLevel: initialData?.spiceLevel?.toString() || '0',
        sourLevel: initialData?.sourLevel?.toString() || '0',
        tangyLevel: initialData?.tangyLevel?.toString() || '0',
        sweetLevel: initialData?.sweetLevel?.toString() || '0',
        heritageMapUrl: initialData?.heritageMapUrl || ''
    });

    const [heritageMap, setHeritageMap] = useState<File | null>(null);
    const [heritageMapPreview, setHeritageMapPreview] = useState<string>(initialData?.heritageMapUrl || '');

    const [ingredients, setIngredients] = useState<any[]>(initialData?.ingredients || []);

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

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products`)
            .then(res => res.json())
            .then((data: any) => {
                const products = Array.isArray(data) ? data : (data.products || []);
                setAllProducts(products);
            })
            .catch(err => console.error('Failed to fetch products:', err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (e.target instanceof HTMLSelectElement && e.target.multiple) {
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
            setFormData(prev => ({ ...prev, [name]: selectedOptions.join(',') }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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

    const handleHeritageMapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setHeritageMap(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setHeritageMapPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const filteredVariants = variants.filter((v: any) => v.price && v.stock);
        const totalStock = filteredVariants.reduce((sum: number, v: any) => sum + parseInt(v.stock || 0), 0);
        const basePrice = filteredVariants.length > 0 ? filteredVariants[0].price : formData.price;

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'stock') {
                data.append('stock', totalStock.toString());
            } else if (key === 'price') {
                data.append('price', basePrice);
            } else if (value) {
                data.append(key, value);
            }
        });

        if (image) {
            data.append('image', image);
        }

        if (heritageMap) {
            data.append('heritageMap', heritageMap);
        }

        data.append('variants', JSON.stringify(filteredVariants));
        data.append('ingredients', JSON.stringify(ingredients));

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

                        <div className="space-y-2 md:col-span-2">
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
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Spice Level (0-5)</label>
                            <div className="flex gap-4">
                                {[0, 1, 2, 3, 4, 5].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, spiceLevel: level.toString() })}
                                        className={`w-10 h-10 rounded-full font-bold transition-all ${formData.spiceLevel === level.toString() ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sour Level (0-5)</label>
                            <div className="flex gap-4">
                                {[0, 1, 2, 3, 4, 5].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, sourLevel: level.toString() })}
                                        className={`w-10 h-10 rounded-full font-bold transition-all ${formData.sourLevel === level.toString() ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tangy Level (0-5)</label>
                            <div className="flex gap-4">
                                {[0, 1, 2, 3, 4, 5].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, tangyLevel: level.toString() })}
                                        className={`w-10 h-10 rounded-full font-bold transition-all ${formData.tangyLevel === level.toString() ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sweet Level (0-5)</label>
                            <div className="flex gap-4">
                                {[0, 1, 2, 3, 4, 5].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, sweetLevel: level.toString() })}
                                        className={`w-10 h-10 rounded-full font-bold transition-all ${formData.sweetLevel === level.toString() ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
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
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Key Ingredients (Comma separated)</label>
                            <textarea
                                name="ingredientsText"
                                value={formData.ingredientsText}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Mango, Salt, Chilli Powder, Gingelly Oil..."
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500 transition-all font-medium text-slate-900"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Heritage Map Background</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleHeritageMapChange}
                                    className="hidden"
                                    id="heritage-map-upload"
                                />
                                <label
                                    htmlFor="heritage-map-upload"
                                    className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer group-hover:bg-slate-100 group-hover:border-[#bf8345] transition-all font-bold text-slate-400"
                                >
                                    {heritageMap ? heritageMap.name : initialData?.heritageMapUrl ? 'CHANGE MAP' : 'USE CUSTOM MAP (Default: India)'}
                                    {heritageMapPreview && <img src={heritageMapPreview} className="mt-2 h-12 object-contain rounded border border-slate-200" alt="Preview" />}
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2 p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                            <ProductIngredientEditor
                                ingredients={ingredients}
                                onChange={setIngredients}
                                selectedMap={heritageMapPreview}
                            />
                        </div>

                        <div className="space-y-4 md:col-span-2 p-6 bg-slate-50 rounded-[32px] border border-slate-100/50">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Pairs Well With (Max 4)</label>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${(formData.pairsWellWith || '').split(',').filter(Boolean).length >= 4
                                    ? 'bg-orange-50 text-orange-600 border-orange-100'
                                    : 'bg-white text-slate-400 border-slate-200'
                                    }`}>
                                    {(formData.pairsWellWith || '').split(',').filter(Boolean).length} / 4 Selected
                                </span>
                            </div>

                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors pointer-events-none">
                                    <Search className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search products to add..."
                                    className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-green-500 transition-all outline-none"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    value={searchQuery}
                                />
                                {searchQuery && (
                                    <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[60] max-h-60 overflow-y-auto p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {allProducts
                                            .filter(p =>
                                                p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                                                (!initialData || p.id !== initialData.id) &&
                                                !(formData.pairsWellWith || '').split(',').includes(p.id.toString())
                                            )
                                            .map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    disabled={(formData.pairsWellWith || '').split(',').filter(Boolean).length >= 4}
                                                    onClick={() => {
                                                        const current = (formData.pairsWellWith || '').split(',').filter(Boolean);
                                                        if (current.length < 4) {
                                                            setFormData({ ...formData, pairsWellWith: [...current, p.id.toString()].join(',') });
                                                            setSearchQuery('');
                                                        }
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl text-sm font-semibold flex justify-between items-center group disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <span className="text-slate-700">{p.name}</span>
                                                    <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-lg group-hover:bg-green-100 group-hover:text-green-600 transition-colors uppercase tracking-widest font-black">Add</span>
                                                </button>
                                            ))}
                                        {allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) && (!initialData || p.id !== initialData.id)).length === 0 && (
                                            <div className="flex flex-col items-center py-8 text-slate-400 gap-2">
                                                <Search className="w-8 h-8 opacity-20" />
                                                <p className="text-xs font-bold uppercase tracking-widest opacity-60">No products found</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {(formData.pairsWellWith || '').split(',').filter(Boolean).map((id: string) => {
                                    const prod = allProducts.find(p => p.id.toString() === id);
                                    if (!prod) return null;
                                    return (
                                        <div key={id} className="bg-white border border-slate-200 pl-4 pr-2 py-2 rounded-xl flex items-center gap-3 shadow-sm hover:border-red-100 hover:bg-red-50/30 transition-all group">
                                            <span className="text-xs font-bold text-slate-700">{prod.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = (formData.pairsWellWith || '').split(',').filter(Boolean).filter((sid: string) => sid !== id);
                                                    setFormData({ ...formData, pairsWellWith: updated.join(',') });
                                                }}
                                                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-100 hover:text-red-500 transition-all"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                                {(!formData.pairsWellWith || formData.pairsWellWith.split(',').filter(Boolean).length === 0) && (
                                    <div className="w-full py-4 text-center border border-dashed border-slate-200 rounded-2xl">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">No pairings selected</p>
                                    </div>
                                )}
                            </div>
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
