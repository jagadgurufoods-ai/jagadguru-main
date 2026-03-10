'use client';

import React, { useState, useRef } from 'react';
import { Spice } from './types';
import { Plus, Trash2, MapPin, X, Image as ImageIcon } from 'lucide-react';

interface ProductIngredientEditorProps {
    ingredients: Spice[];
    onChange: (ingredients: Spice[]) => void;
    selectedMap?: string;
}

export default function ProductIngredientEditor({ ingredients, onChange, selectedMap }: ProductIngredientEditorProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const mapImage = selectedMap || '/default-map.jpeg';
    const imageRef = useRef<HTMLImageElement>(null);

    const addIngredient = () => {
        const newIngredient: Spice = {
            id: Date.now().toString(),
            name: '',
            originState: '',
            history: '',
            mapX: 50,
            mapY: 50
        };
        onChange([...ingredients, newIngredient]);
        setEditingIndex(ingredients.length);
    };

    const removeIngredient = (index: number) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        onChange(newIngredients);
        if (editingIndex === index) setEditingIndex(null);
    };

    const updateIngredient = (index: number, updates: Partial<Spice>) => {
        const newIngredients = ingredients.map((ing, i) =>
            i === index ? { ...ing, ...updates } : ing
        );
        onChange(newIngredients);
    };

    const handleMapClick = (e: React.MouseEvent<HTMLImageElement>, index: number) => {
        if (!imageRef.current) return;
        const rect = imageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        updateIngredient(index, {
            mapX: parseFloat(xPercent.toFixed(2)),
            mapY: parseFloat(yPercent.toFixed(2))
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Heritage Map Ingredients</h3>
                <button
                    type="button"
                    onClick={addIngredient}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                >
                    <Plus className="w-4 h-4" /> ADD INGREDIENT
                </button>
            </div>

            <div className="space-y-4">
                {ingredients.map((ing, index) => (
                    <div key={ing.id} className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
                        <div className="p-4 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#bf8345]/10 flex items-center justify-center text-[#bf8345]">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{ing.name || 'Untitled Ingredient'}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ing.originState || 'No Region'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {editingIndex === index ? 'Collapse' : 'Edit Details'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeIngredient(index)}
                                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {editingIndex === index && (
                            <div className="p-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingredient Name</label>
                                        <input
                                            value={ing.name}
                                            onChange={(e) => updateIngredient(index, { name: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium"
                                            placeholder="e.g. Kashmiri Chili"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin State/Region</label>
                                        <input
                                            value={ing.originState}
                                            onChange={(e) => updateIngredient(index, { originState: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium"
                                            placeholder="e.g. Kashmir"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">History / Description</label>
                                        <textarea
                                            value={ing.history}
                                            onChange={(e) => updateIngredient(index, { history: e.target.value })}
                                            rows={3}
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium"
                                            placeholder="Authentic story of this ingredient..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Icon Image</label>
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                    {ing.imageUrl ? <img src={ing.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-slate-400" />}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => updateIngredient(index, { imageUrl: reader.result as string });
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    className="hidden"
                                                    id={`icon-${index}`}
                                                />
                                                <label htmlFor={`icon-${index}`} className="text-[10px] font-bold text-[#bf8345] cursor-pointer hover:underline uppercase tracking-tight">Upload</label>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Map Pin Image</label>
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                    {ing.mapImageUrl ? <img src={ing.mapImageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-slate-400" />}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => updateIngredient(index, { mapImageUrl: reader.result as string });
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    className="hidden"
                                                    id={`map-img-${index}`}
                                                />
                                                <label htmlFor={`map-img-${index}`} className="text-[10px] font-bold text-[#bf8345] cursor-pointer hover:underline uppercase tracking-tight">Upload</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Map Popup Caption</label>
                                        <input
                                            value={ing.mapImageCaption || ''}
                                            onChange={(e) => updateIngredient(index, { mapImageCaption: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium"
                                            placeholder="The Land of Prized Spices..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Map X (%)</label>
                                            <input
                                                type="number"
                                                value={ing.mapX || ''}
                                                onChange={(e) => updateIngredient(index, { mapX: parseFloat(e.target.value) })}
                                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Map Y (%)</label>
                                            <input
                                                type="number"
                                                value={ing.mapY || ''}
                                                onChange={(e) => updateIngredient(index, { mapY: parseFloat(e.target.value) })}
                                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-mono"
                                            />
                                        </div>
                                    </div>

                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Plot on Map (Click to set)</label>
                                    <div className="relative border border-slate-100 rounded-2xl overflow-hidden bg-slate-100 aspect-square">
                                        <img
                                            ref={imageRef}
                                            src={mapImage}
                                            alt="Map Plotter"
                                            onClick={(e) => handleMapClick(e, index)}
                                            className="w-full h-full object-contain cursor-crosshair"
                                        />
                                        {ing.mapX !== undefined && ing.mapY !== undefined && (
                                            <div
                                                className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                                                style={{ left: `${ing.mapX}%`, top: `${ing.mapY}%` }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {ingredients.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No map ingredients added yet.<br />Add ingredients to show them on the Heritage Map.</p>
                </div>
            )}
        </div>
    );
}
