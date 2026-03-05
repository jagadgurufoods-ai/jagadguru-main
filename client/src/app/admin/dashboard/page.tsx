'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProductForm from './ProductForm';
import CategoryForm from './CategoryForm';

const API_URL = 'http://localhost:5001/api';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: { title: string } | string;
    imageUrl?: string;
}

interface Category {
    id: number;
    title: string;
    description: string;
    _count?: { products: number };
}

interface Banner {
    id: number;
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
    isActive: boolean;
    displayOrder: number;
}

interface HomeSection {
    id: number;
    title: string;
    slug: string;
    isActive: boolean;
    displayOrder: number;
    products: { id: number; productId: number; product: { id: number; name: string; imageUrl?: string } }[];
}

type ViewType = 'products' | 'categories' | 'banners' | 'sections' | 'orders';

export default function AdminDashboard() {
    const { token, isAdmin, isLoggedIn, loading: authLoading } = useAuth();
    const [view, setView] = useState<ViewType>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [sections, setSections] = useState<HomeSection[]>([]);
    const [showProductForm, setShowProductForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showBannerForm, setShowBannerForm] = useState(false);
    const [showSectionForm, setShowSectionForm] = useState(false);
    const [showAddProductToSection, setShowAddProductToSection] = useState<number | null>(null);

    // Banner form state
    const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', ctaText: '', ctaLink: '', displayOrder: '' });
    const [bannerImage, setBannerImage] = useState<File | null>(null);

    // Section form state
    const [sectionForm, setSectionForm] = useState({ title: '', slug: '', displayOrder: '' });

    // Add product to section state
    const [selectedProductId, setSelectedProductId] = useState('');

    const headers = () => ({ Authorization: `Bearer ${token}` });

    const fetchProducts = () => {
        fetch(`${API_URL}/products`).then(r => r.json()).then(d => Array.isArray(d) ? setProducts(d) : setProducts([])).catch(console.error);
    };
    const fetchCategories = () => {
        fetch(`${API_URL}/categories`).then(r => r.json()).then(d => Array.isArray(d) ? setCategories(d) : setCategories([])).catch(console.error);
    };
    const fetchBanners = () => {
        fetch(`${API_URL}/cms/banners`, { headers: headers() }).then(r => r.json()).then(d => Array.isArray(d) ? setBanners(d) : setBanners([])).catch(console.error);
    };
    const fetchSections = () => {
        fetch(`${API_URL}/cms/sections`, { headers: headers() }).then(r => r.json()).then(d => Array.isArray(d) ? setSections(d) : setSections([])).catch(console.error);
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        if (token) {
            fetchBanners();
            fetchSections();
        }
    }, [token]);

    const deleteProduct = async (id: number) => {
        if (!confirm('Delete this product?')) return;
        await fetch(`${API_URL}/products/${id}`, { method: 'DELETE', headers: headers() });
        fetchProducts();
    };

    const toggleBanner = async (id: number) => {
        await fetch(`${API_URL}/cms/banners/${id}/toggle`, { method: 'PATCH', headers: headers() });
        fetchBanners();
    };

    const deleteBanner = async (id: number) => {
        if (!confirm('Delete this banner?')) return;
        await fetch(`${API_URL}/cms/banners/${id}`, { method: 'DELETE', headers: headers() });
        fetchBanners();
    };

    const createBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('title', bannerForm.title);
        fd.append('subtitle', bannerForm.subtitle);
        fd.append('ctaText', bannerForm.ctaText);
        fd.append('ctaLink', bannerForm.ctaLink);
        if (bannerForm.displayOrder) fd.append('displayOrder', bannerForm.displayOrder);
        if (bannerImage) fd.append('image', bannerImage);
        await fetch(`${API_URL}/cms/banners`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
        setShowBannerForm(false);
        setBannerForm({ title: '', subtitle: '', ctaText: '', ctaLink: '', displayOrder: '' });
        setBannerImage(null);
        fetchBanners();
    };

    const toggleSection = async (id: number) => {
        await fetch(`${API_URL}/cms/sections/${id}/toggle`, { method: 'PATCH', headers: headers() });
        fetchSections();
    };

    const deleteSection = async (id: number) => {
        if (!confirm('Delete this section?')) return;
        await fetch(`${API_URL}/cms/sections/${id}`, { method: 'DELETE', headers: headers() });
        fetchSections();
    };

    const createSection = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch(`${API_URL}/cms/sections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers() },
            body: JSON.stringify({
                title: sectionForm.title,
                slug: sectionForm.slug || sectionForm.title.toLowerCase().replace(/\s+/g, '-'),
                displayOrder: sectionForm.displayOrder ? parseInt(sectionForm.displayOrder) : null
            })
        });
        setShowSectionForm(false);
        setSectionForm({ title: '', slug: '', displayOrder: '' });
        fetchSections();
    };

    const addProductToSection = async (sectionId: number) => {
        if (!selectedProductId) return;
        await fetch(`${API_URL}/cms/sections/${sectionId}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers() },
            body: JSON.stringify({ productId: parseInt(selectedProductId) })
        });
        setShowAddProductToSection(null);
        setSelectedProductId('');
        fetchSections();
    };

    const removeProductFromSection = async (sectionId: number, productId: number) => {
        await fetch(`${API_URL}/cms/sections/${sectionId}/products/${productId}`, { method: 'DELETE', headers: headers() });
        fetchSections();
    };

    if (authLoading) return <div className="p-8 text-slate-400">Loading...</div>;
    if (!isLoggedIn || !isAdmin) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Admin Access Required</h1>
                <p className="text-slate-500 mb-6">Please log in with an admin account.</p>
                <a href="/login" className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold">Login</a>
            </div>
        );
    }

    const tabs: { key: ViewType; label: string }[] = [
        { key: 'products', label: 'Products' },
        { key: 'categories', label: 'Categories' },
        { key: 'banners', label: 'Banners' },
        { key: 'sections', label: 'Home Sections' },
    ];

    return (
        <div className="max-w-[1440px] mx-auto px-6 py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
                    <div className="mt-4 flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200 flex-wrap">
                        {tabs.map(tab => (
                            <button key={tab.key} onClick={() => setView(tab.key)}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === tab.key ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (view === 'products') setShowProductForm(true);
                        else if (view === 'categories') setShowCategoryForm(true);
                        else if (view === 'banners') setShowBannerForm(true);
                        else if (view === 'sections') setShowSectionForm(true);
                    }}
                    className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-green-700 transition-all transform hover:scale-[1.02] shadow-xl shadow-green-200"
                >
                    + ADD NEW {view === 'products' ? 'PRODUCT' : view === 'categories' ? 'CATEGORY' : view === 'banners' ? 'BANNER' : 'SECTION'}
                </button>
            </div>

            {showProductForm && <ProductForm onClose={() => setShowProductForm(false)} onSuccess={fetchProducts} />}
            {showCategoryForm && <CategoryForm onClose={() => setShowCategoryForm(false)} onSuccess={fetchCategories} />}

            {/* Banner Form */}
            {showBannerForm && (
                <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-lg">
                    <h2 className="text-xl font-bold mb-6">Add New Banner</h2>
                    <form onSubmit={createBanner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder="Title" value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                            className="px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                        <input placeholder="Subtitle" value={bannerForm.subtitle} onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                            className="px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                        <input placeholder="CTA Text" value={bannerForm.ctaText} onChange={e => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                            className="px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                        <input placeholder="CTA Link" value={bannerForm.ctaLink} onChange={e => setBannerForm({ ...bannerForm, ctaLink: e.target.value })}
                            className="px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                        <input type="number" placeholder="Display Order" value={bannerForm.displayOrder} onChange={e => setBannerForm({ ...bannerForm, displayOrder: e.target.value })}
                            className="px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                        <input type="file" accept="image/*" onChange={e => setBannerImage(e.target.files?.[0] || null)}
                            className="px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                        <div className="md:col-span-2 flex gap-4">
                            <button type="submit" className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold">Create Banner</button>
                            <button type="button" onClick={() => setShowBannerForm(false)} className="px-8 py-3 border border-slate-200 rounded-xl font-bold text-slate-500">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Section Form */}
            {showSectionForm && (
                <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-lg">
                    <h2 className="text-xl font-bold mb-6">Add New Section</h2>
                    <form onSubmit={createSection} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input placeholder="Title (e.g. Best Sellers)" required value={sectionForm.title} onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })}
                            className="px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                        <input placeholder="Slug (auto-generated)" value={sectionForm.slug} onChange={e => setSectionForm({ ...sectionForm, slug: e.target.value })}
                            className="px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                        <input type="number" placeholder="Display Order" value={sectionForm.displayOrder} onChange={e => setSectionForm({ ...sectionForm, displayOrder: e.target.value })}
                            className="px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                        <div className="md:col-span-3 flex gap-4">
                            <button type="submit" className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold">Create Section</button>
                            <button type="button" onClick={() => setShowSectionForm(false)} className="px-8 py-3 border border-slate-200 rounded-xl font-bold text-slate-500">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Products Table */}
            {view === 'products' && (
                <div className="bg-white shadow-2xl shadow-slate-200/60 rounded-[32px] overflow-hidden border border-slate-100">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Product</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Price</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Stock</th>
                                <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex-shrink-0 mr-4 border border-slate-200 overflow-hidden">
                                                {product.imageUrl && <img src={product.imageUrl} className="h-full w-full object-cover" />}
                                            </div>
                                            <div className="text-sm font-bold text-slate-900 group-hover:text-green-700 transition-colors">{product.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-500">
                                        {typeof product.category === 'object' ? product.category.title : product.category}
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-slate-900">₹{product.price}</td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                                            {product.stock} units
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-bold">
                                        <button onClick={() => deleteProduct(product.id)} className="text-slate-400 hover:text-red-600 transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr><td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-medium italic">No products found...</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Categories Table */}
            {view === 'categories' && (
                <div className="bg-white shadow-2xl shadow-slate-200/60 rounded-[32px] overflow-hidden border border-slate-100">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Category Name</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Products</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {categories.map(category => (
                                <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5 text-sm font-bold text-slate-900">{category.title}</td>
                                    <td className="px-8 py-5 text-sm text-slate-500 max-w-xs truncate">{category.description || 'No description'}</td>
                                    <td className="px-8 py-5 text-sm font-black text-slate-900">{category._count?.products || 0}</td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr><td colSpan={3} className="px-8 py-16 text-center text-slate-400 font-medium italic">No categories found...</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Banners Table */}
            {view === 'banners' && (
                <div className="bg-white shadow-2xl shadow-slate-200/60 rounded-[32px] overflow-hidden border border-slate-100">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Banner</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Title</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Order</th>
                                <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {banners.map(banner => (
                                <tr key={banner.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="h-16 w-28 rounded-xl bg-slate-100 overflow-hidden">
                                            <img src={banner.imageUrl} className="h-full w-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-slate-900">{banner.title || '(no title)'}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${banner.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                                            {banner.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-slate-500">{banner.displayOrder ?? '-'}</td>
                                    <td className="px-8 py-5 text-right text-sm font-bold space-x-4">
                                        <button onClick={() => toggleBanner(banner.id)} className="text-slate-400 hover:text-green-600 transition-colors">
                                            {banner.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button onClick={() => deleteBanner(banner.id)} className="text-slate-400 hover:text-red-600 transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {banners.length === 0 && (
                                <tr><td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-medium italic">No banners yet...</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Sections Management */}
            {view === 'sections' && (
                <div className="space-y-6">
                    {sections.map(section => (
                        <div key={section.id} className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{section.title}</h3>
                                    <p className="text-sm text-slate-400">Slug: {section.slug} • Order: {section.displayOrder ?? '-'}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${section.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                                        {section.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <button onClick={() => toggleSection(section.id)} className="text-sm font-bold text-slate-400 hover:text-green-600">
                                        {section.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button onClick={() => setShowAddProductToSection(showAddProductToSection === section.id ? null : section.id)}
                                        className="text-sm font-bold text-green-600 hover:text-green-700">+ Add Product</button>
                                    <button onClick={() => deleteSection(section.id)} className="text-sm font-bold text-slate-400 hover:text-red-600">Delete</button>
                                </div>
                            </div>

                            {showAddProductToSection === section.id && (
                                <div className="mb-6 flex gap-4 items-center bg-slate-50 p-4 rounded-xl">
                                    <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}
                                        className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm">
                                        <option value="">Select a product</option>
                                        {products.filter(p => !section.products.some(sp => sp.productId === p.id)).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <button onClick={() => addProductToSection(section.id)}
                                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-sm">Add</button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {section.products.map(sp => (
                                    <div key={sp.id} className="relative bg-slate-50 rounded-xl p-3 group">
                                        <div className="h-20 w-full rounded-lg bg-slate-200 overflow-hidden mb-2">
                                            {sp.product.imageUrl && <img src={sp.product.imageUrl} className="h-full w-full object-cover" />}
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 truncate">{sp.product.name}</p>
                                        <button
                                            onClick={() => removeProductFromSection(section.id, sp.productId)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        >✕</button>
                                    </div>
                                ))}
                                {section.products.length === 0 && (
                                    <p className="text-sm text-slate-400 italic col-span-full">No products in this section</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {sections.length === 0 && (
                        <div className="text-center py-16 text-slate-400 italic">No sections yet. Create one to get started.</div>
                    )}
                </div>
            )}
        </div>
    );
}
