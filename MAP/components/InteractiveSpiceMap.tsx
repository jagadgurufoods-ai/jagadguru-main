'use client';

import React, { useState, useEffect } from 'react';
import { Spice } from './types';

// Default image to use if the user hasn't uploaded one for a pin
const DEFAULT_CARD_IMAGE = 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=400';

export default function InteractiveSpiceMap({ spices: initialSpices = [] }: { spices?: Spice[] }) {
  const [selectedSpice, setSelectedSpice] = useState<Spice | null>(null);
  
  const [spices, setSpices] = useState<Spice[]>(initialSpices);
  const [mapImage, setMapImage] = useState<string>('/india-map.png');

  const loadData = () => {
    const loaded = localStorage.getItem('spices_data');
    if (loaded) {
      const parsed = JSON.parse(loaded);
      setSpices(parsed);
      setSelectedSpice(current => {
        if (!current) return null;
        return parsed.find((s: Spice) => s.id === current.id) || null;
      });
    } else {
      setSpices(initialSpices);
    }
    const loadedImg = localStorage.getItem('map_image_data');
    if (loadedImg) setMapImage(loadedImg);
  };

  useEffect(() => {
    loadData();
    const handleCustomEvent = () => loadData();
    window.addEventListener('spices_updated', handleCustomEvent);
    window.addEventListener('map_image_changed', (e: any) => setMapImage(e.detail));
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'spices_data' || e.key === 'map_image_data') loadData();
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('spices_updated', handleCustomEvent);
      window.removeEventListener('map_image_changed', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 md:px-8 font-sans text-slate-800 bg-[#fdfaf5]">
      
      <h2 className="text-2xl font-bold mb-8 text-[#3d3329]">ingredients</h2>

      <div className="flex flex-col lg:flex-row items-stretch gap-8 relative">
        
        {/* Left List */}
        <div className="w-full lg:w-1/4 shrink-0 flex flex-col justify-start relative z-10">
          
          <div className="absolute right-0 top-0 bottom-0 w-px bg-[#d8cbb5]/50"></div>

          <ul className="space-y-3 pr-6 relative z-10 w-full">
            {spices.map((spice) => (
              <li key={spice.id}>
                <button
                  onClick={() => setSelectedSpice(spice)}
                  className={`w-[110%] flex items-center gap-4 py-3 px-4 transition-colors ${
                    selectedSpice?.id === spice.id 
                    ? 'bg-[#f5ebd1] font-bold text-[#3d3329]' 
                    : 'bg-transparent font-medium text-[#5c5042] hover:bg-[#f5ebd1]/30'
                  }`}
                >
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                    {spice.image_url ? (
                      <img src={spice.image_url} alt={spice.name} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <span className="text-[10px] text-[#8a7f71] italic text-center leading-none">no<br/>icon</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-start">
                    <span className="text-[15px]">{spice.name}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Center Text Details */}
        <div className="w-full lg:w-1/4 shrink-0 mt-8 lg:mt-0 transition-opacity duration-300 relative z-10">
          {selectedSpice ? (
            <div className="pr-2">
              <h3 className="text-[16px] font-bold text-[#3d3329] mb-1">{selectedSpice.name}</h3>
              <p className="text-[13px] italic text-[#8a7f71] mb-3">From {selectedSpice.origin_state}</p>
              <div className="text-[#5c5042] text-[13px] leading-[1.6] whitespace-pre-wrap">
                {selectedSpice.history || 'Select an ingredient to view its details and historical origin.'}
              </div>
            </div>
          ) : (
            <div className="text-[#8a7f71] italic text-sm mt-4">Select an ingredient to view its details and origin.</div>
          )}
        </div>

        {/* Right Map */}
        <div className="w-full lg:w-2/4 flex items-center justify-center relative mt-8 lg:mt-0 pointer-events-none">
          
          {/* We use scale-[1.20] and origin-right/center so it visually scales up 20% without breaking the grid flex layout */}
          <div className="relative inline-block w-full max-w-full flex items-center justify-center transform scale-[1.20] origin-center lg:origin-right pointer-events-auto overflow-visible">
            
            <img 
              src={mapImage} 
              alt="Spice Origin Map" 
              className="block w-full h-auto object-contain pointer-events-none"
            />
            
            {/* Dynamic Map Pin w/ Card */}
            {selectedSpice && selectedSpice.map_x !== null && selectedSpice.map_y !== null && (
              <div 
                className="absolute z-30 transition-all duration-[400ms] ease-out pointer-events-auto"
                style={{ 
                  left: `${selectedSpice.map_x}%`, 
                  top: `${selectedSpice.map_y}%`,
                  transform: 'translate(-50%, -100%)' 
                }}
              >
                <div className="relative flex flex-col items-center">
                  
                  {/* Photo Card format from screenshot - scaled down slightly to offset the parent map 1.2x scale */}
                  <div className="mb-1 bg-[#fdfaf5] p-1.5 rounded-[10px] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] border-[1.5px] border-[#e8deca] w-[125px] transform scale-[0.85] origin-bottom animate-fade-in-up flex flex-col items-center z-10">
                    
                    <div className="w-full h-[85px] rounded-[6px] overflow-hidden bg-slate-100 mb-1">
                      <img 
                        src={selectedSpice.map_image_url || DEFAULT_CARD_IMAGE} 
                        alt={selectedSpice.origin_state} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="text-center text-[#3d3329] text-[9.5px] leading-[1.2] px-1 py-1.5 min-h-[28px] flex items-center justify-center w-full">
                      {selectedSpice.map_image_caption || `${selectedSpice.origin_state}: The Land of Prized ${selectedSpice.name}`}
                    </div>

                    {/* Faint connector line */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-[5px] bg-[#d8cbb5]"></div>
                  </div>

                  {/* The brown Region label pin directly below - scaled down slightly */}
                  <div className="relative mt-1 transform scale-[0.85] origin-top">
                    {/* CIRCULAR WAVE ANIMATION BEHIND THE PIN */}
                    <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#6d4626] animate-[ripple_2s_infinite_cubic-bezier(0.4,0,0.2,1)_0s] -z-10 pointer-events-none mix-blend-multiply"></div>
                    <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#6d4626] animate-[ripple_2s_infinite_cubic-bezier(0.4,0,0.2,1)_0.6s] -z-10 pointer-events-none mix-blend-multiply"></div>
                    <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#6d4626] animate-[ripple_2s_infinite_cubic-bezier(0.4,0,0.2,1)_1.2s] -z-10 pointer-events-none mix-blend-multiply"></div>

                    <div className="bg-[#6d4626] text-[#fdfaf5] text-[10px] font-bold uppercase tracking-[0.1em] py-[5px] px-[12px] rounded-[3px] shadow-sm flex items-center justify-center whitespace-nowrap z-20 relative">
                      {selectedSpice.origin_state}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-[#6d4626]"></div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Faint dots for OTHER ALREADY SAVED spices - scaled down slightly */}
            {spices.map(s => (s.id !== selectedSpice?.id && s.map_x !== null && s.map_y !== null) && (
              <div 
                key={s.id}
                className="absolute z-10 opacity-40 pointer-events-none transition-all duration-300 group cursor-pointer hover:opacity-100"
                style={{ left: `${s.map_x}%`, top: `${s.map_y}%`, transform: 'translate(-50%, -50%)' }}
                onClick={() => setSelectedSpice(s)}
              >
                <div className="w-2 h-2 rounded-full bg-[#6d4626] border border-[#fdfaf5]/50 drop-shadow-sm group-hover:scale-150 transition-transform pointer-events-auto transform scale-[0.85]"></div>
              </div>
            ))}
          </div>
          
        </div>

      </div>
      
      <div className="mt-8 text-right text-[10px] italic text-[#8a7f71]">
        Map used for representational purpose only. Not to be treated as an accurate depiction.
      </div>
    </div>
  );
}
