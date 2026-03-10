'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Spice } from './types';

export default function AdminMapPlotter() {
  const [spices, setSpices] = useState<Spice[]>([]);
  const [mapImage, setMapImage] = useState<string>('/default-map.jpeg');

  // Current edit state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string>('');
  const [name, setName] = useState('');
  const [stateName, setStateName] = useState('');
  const [history, setHistory] = useState('');
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  // New state for spice image
  const [spiceImage, setSpiceImage] = useState<string>('');
  const [mapPopupImage, setMapPopupImage] = useState<string>('');
  const [mapPopupCaption, setMapPopupCaption] = useState<string>('');

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Load existing data from localStorage
    const loaded = localStorage.getItem('spices_data');
    if (loaded) setSpices(JSON.parse(loaded));

    const loadedImg = localStorage.getItem('map_image_data');
    if (loadedImg) setMapImage(loadedImg);
  }, []);

  const saveToStorage = (newSpices: Spice[]) => {
    setSpices(newSpices);
    localStorage.setItem('spices_data', JSON.stringify(newSpices));
  };

  const handleMapImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3.5 * 1024 * 1024) {
        alert("This map image is too large! Please upload a file smaller than 3MB for this demo.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setMapImage(base64String);
        try {
          localStorage.setItem('map_image_data', base64String);
          window.dispatchEvent(new CustomEvent('map_image_changed', { detail: base64String }));
          alert("Map uploaded successfully!");
        } catch (err) {
          alert("Error saving image. The file might be too large for browser local storage.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpiceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert("This spice icon is too large! Please upload a small image (under 500KB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSpiceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMapPopupImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("This popup image is too large! Please upload a small image (under 1MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMapPopupImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setCoords({ x: parseFloat(xPercent.toFixed(2)), y: parseFloat(yPercent.toFixed(2)) });
  };

  const handleSaveSpice = () => {
    if (!name || !stateName || !history) {
      alert("Please fill out Name, State, and History.");
      return;
    }
    if (!coords) {
      alert("Please CLICK on the uploaded map on the right to place a pin.");
      return;
    }

    if (isEditing) {
      const updated = spices.map(s =>
        s.id === currentId
          ? {
            ...s,
            name,
            originState: stateName,
            history,
            mapX: coords.x,
            mapY: coords.y,
            imageUrl: spiceImage,
            mapImageUrl: mapPopupImage,
            mapImageCaption: mapPopupCaption
          }
          : s
      );
      saveToStorage(updated);
      alert("Spice updated successfully!");
    } else {
      const newSpice: Spice = {
        id: Date.now().toString(),
        name,
        originState: stateName,
        history,
        mapX: coords.x,
        mapY: coords.y,
        imageUrl: spiceImage,
        mapImageUrl: mapPopupImage,
        mapImageCaption: mapPopupCaption
      };
      saveToStorage([...spices, newSpice]);
      alert("New spice saved and pinned to map!");
    }

    resetForm();
    window.dispatchEvent(new Event('spices_updated'));
  };

  const editSpice = (spice: Spice) => {
    setIsEditing(true);
    setCurrentId(spice.id.toString());
    setName(spice.name);
    setStateName(spice.originState);
    setHistory(spice.history || '');
    setSpiceImage(spice.imageUrl || '');
    setMapPopupImage(spice.mapImageUrl || '');
    setMapPopupCaption(spice.mapImageCaption || '');
    if (spice.mapX !== null && spice.mapY !== null) {
      setCoords({ x: spice.mapX, y: spice.mapY });
    } else {
      setCoords(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteSpice = (id: string | number) => {
    if (confirm("Are you sure you want to delete this spice?")) {
      saveToStorage(spices.filter(s => s.id !== id));
      if (currentId === id) resetForm();
      window.dispatchEvent(new Event('spices_updated'));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId('');
    setName('');
    setStateName('');
    setHistory('');
    setSpiceImage('');
    setMapPopupImage('');
    setMapPopupCaption('');
    setCoords(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 bg-white rounded-xl shadow-[0_5px_40px_-10px_rgba(0,0,0,0.1)] mt-10 border border-slate-200 text-slate-800 font-sans z-50 relative">

      {/* Map Image Upload Box */}
      <div className="mb-8 p-6 bg-slate-50 border rounded-xl shadow-inner flex flex-col md:flex-row items-center gap-6 justify-between">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1 tracking-wide uppercase">Change Map Background</label>
          <p className="text-slate-500 text-sm">Upload a clean map image to serve as your new pin background.</p>
        </div>
        <div className="shrink-0">
          <input
            type="file"
            accept="image/*"
            onChange={handleMapImageUpload}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 transition-colors cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Side: Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border rounded-xl shadow-sm bg-white overflow-hidden">
            <div className={`p-4 text-white font-bold flex justify-between items-center ${isEditing ? 'bg-[#6d4626]' : 'bg-slate-800'}`}>
              <h3>{isEditing ? 'Editing Existing Spice' : 'Add New Map Point'}</h3>
              {isEditing && <button onClick={resetForm} className="text-xs px-2 py-1 bg-white/20 hover:bg-white/40 rounded transition">Cancel</button>}
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Spice Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border-slate-300 shadow-sm rounded-md p-2.5 outline-none focus:ring-2 focus:ring-[#6d4626] border" placeholder="e.g. Mango" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Origin Region/State</label>
                <input type="text" value={stateName} onChange={e => setStateName(e.target.value)} className="w-full border-slate-300 shadow-sm rounded-md p-2.5 outline-none focus:ring-2 focus:ring-[#6d4626] border" placeholder="e.g. Nooziveedu" />
              </div>

              {/* Image Upload for Spice Icon */}
              <div className="border border-slate-200 rounded-md p-3 bg-slate-50">
                <label className="block text-sm font-semibold mb-2 text-slate-700 flex justify-between">
                  <span>List Icon</span>
                  {spiceImage && <span className="text-xs text-green-600 font-bold">✓ Attached</span>}
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                    {spiceImage ? (
                      <img src={spiceImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-400">none</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSpiceImageUpload}
                    className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#f5ebd1] file:text-[#6d4626] hover:file:bg-[#e8deca] cursor-pointer"
                  />
                </div>
                {spiceImage && (
                  <button onClick={() => setSpiceImage('')} className="text-xs text-red-500 hover:text-red-700 mt-2 font-medium">
                    Remove Image
                  </button>
                )}
              </div>

              {/* Map Popup Image Upload */}
              <div className="border border-slate-200 rounded-md p-3 bg-slate-50/50">
                <label className="block text-sm font-semibold mb-2 text-slate-700 flex justify-between">
                  <span>Map Pin Popup Image</span>
                  {mapPopupImage && <span className="text-xs text-green-600 font-bold">✓ Attached</span>}
                </label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-white border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                      {mapPopupImage ? (
                        <img src={mapPopupImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-400">none</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMapPopupImageUpload}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#f5ebd1] file:text-[#6d4626] hover:file:bg-[#e8deca] cursor-pointer"
                    />
                  </div>
                  {mapPopupImage && (
                    <>
                      <input
                        type="text"
                        value={mapPopupCaption}
                        onChange={e => setMapPopupCaption(e.target.value)}
                        className="w-full border-slate-300 shadow-sm rounded-md p-2 outline-none focus:ring-2 focus:ring-[#6d4626] border text-xs"
                        placeholder="Caption (e.g. Khammam: The Land of Prized Mangoes)"
                      />
                      <button onClick={() => { setMapPopupImage(''); setMapPopupCaption(''); }} className="text-xs text-red-500 hover:text-red-700 text-left font-medium">
                        Remove Popup Image & Caption
                      </button>
                    </>
                  )}
                </div>
              </div>


              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">History / Description</label>
                <textarea value={history} onChange={e => setHistory(e.target.value)} className="w-full border-slate-300 shadow-sm rounded-md p-2.5 outline-none focus:ring-2 focus:ring-[#6d4626] border text-sm" rows={4} placeholder="Description about the ingredient..." />
              </div>

              <div className={`p-3 rounded-md border text-sm flex items-center gap-2 ${coords ? 'bg-green-50 text-green-800 border-green-200' : 'bg-orange-50 text-orange-800 border-orange-200'}`}>
                {coords ? (
                  <div className="w-full">
                    <span className="font-semibold block mb-1">Point Set Successfully:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded shadow-sm text-xs border">X: {coords.x}%, Y: {coords.y}%</span>
                  </div>
                ) : (
                  <span className="font-semibold flex items-center gap-2 text-[#6d4626]">
                    <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                    Step 2: Click map to pin!
                  </span>
                )}
              </div>

              <button onClick={handleSaveSpice} className={`w-full text-white p-3 rounded-md font-bold tracking-wide transition shadow-md ${isEditing ? 'bg-[#6d4626] hover:bg-[#5c3a20]' : 'bg-[#6d4626] hover:bg-[#5c3a20]'}`}>
                {isEditing ? 'UPDATE THIS INGREDIENT' : 'SAVE TO DATABASE'}
              </button>
            </div>
          </div>

          <div className="border rounded-xl shadow-sm bg-white overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 bg-slate-100 border-b font-bold text-slate-800">
              Saved Database Entries ({spices.length})
            </div>
            <ul className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
              {spices.length === 0 && <p className="text-slate-500 text-sm italic p-4 text-center">No additions yet. Save your first entry above.</p>}
              {spices.map(spice => (
                <li key={spice.id} className={`flex justify-between items-center p-3 border rounded-lg transition shadow-sm ${currentId === spice.id ? 'bg-[#f5ebd1] border-[#d8cbb5]' : 'bg-white hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3 truncate pr-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {spice.imageUrl ? <img src={spice.imageUrl} alt="icon" className="w-full h-full object-cover" /> : <span className="text-[8px] text-slate-400">img</span>}
                      {/* Indicator if they have a map popup image */}
                      {spice.mapImageUrl && <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block text-sm truncate">{spice.name}</span>
                      <span className="text-xs text-slate-500 truncate block">{spice.originState}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => editSpice(spice)} className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded font-semibold text-slate-700">Edit</button>
                    <button onClick={() => deleteSpice(spice.id)} className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded font-semibold text-red-600">Del</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side: Map */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-slate-800 text-white p-3 rounded-t-xl flex justify-between items-center shadow-sm z-10">
            <span className="font-bold text-sm tracking-wide">Interactive Canvas: Click to aim target</span>
            {coords && <span className="text-xs font-mono bg-black/40 px-3 py-1 text-green-300 rounded-full">Target: {coords.x}%, {coords.y}%</span>}
          </div>

          <div className="relative border-x-2 border-b-2 border-slate-200 rounded-b-xl overflow-hidden shadow-inner flex items-center justify-center bg-slate-200/50 w-full cursor-crosshair group py-4 flex-1">
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex justify-center items-start pt-4 z-0">
              <span className="select-none text-white bg-black/50 px-4 py-2 rounded-full font-bold backdrop-blur-[2px] shadow-sm">Use crosshair to aim</span>
            </div>

            <div className="relative inline-block max-w-full z-10">
              <img
                ref={imageRef}
                src={mapImage}
                alt="Base Map Environment"
                onClick={handleMapClick}
                className="max-w-full max-h-[65vh] w-auto h-auto object-contain block select-none pointer-events-auto shadow-sm bg-[#fdfaf5]"
              />

              {/* Active crosshair */}
              {coords && (
                <div
                  className="absolute z-20 pointer-events-none transition-all duration-300 ease-out"
                  style={{ left: `${coords.x}%`, top: `${coords.y}%`, transform: 'translate(-50%, -100%)' }}
                >
                  <div className="w-10 h-10 flex items-center justify-center text-red-600 drop-shadow-2xl animate-pulse">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Saved flat brown dots */}
              {spices.map(s => (s.id !== currentId && s.mapX !== null && s.mapY !== null) && (
                <div
                  key={s.id}
                  className="absolute z-10 opacity-60 pointer-events-none"
                  style={{ left: `${s.mapX}%`, top: `${s.mapY}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-3 h-3 rounded-full bg-[#6d4626]"></div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
