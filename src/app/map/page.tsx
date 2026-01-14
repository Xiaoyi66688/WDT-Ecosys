"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, MarkerClusterer, InfoWindow } from "@react-google-maps/api";
import { Search, ChevronDown, Check, X, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { getMapMarkers, Organization } from "@/lib/xano-api";

// =========================================================================
// 【同事注意 / FOR COLLEAGUE】
// 中文：你需要在这里填入真实的 Google Maps API Key。
// English: You need to insert a real Google Maps API Key here.
// =========================================================================
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// --- Types & Config ---
const HAMILTON_CENTER = { lat: -37.787, lng: 175.279 }; // Hamilton, NZ

const TAGS = [
  { label: "Digital equity", color: "bg-red-100 text-red-700", border: "border-red-200" },
  { label: "Digital inclusion", color: "bg-blue-100 text-blue-700", border: "border-blue-200" },
  { label: "Industry pathway", color: "bg-cyan-100 text-cyan-700", border: "border-cyan-200" },
  { label: "Internship pathway", color: "bg-green-100 text-green-700", border: "border-green-200" },
  { label: "Pastoral care", color: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" },
];

const AOE_OPTIONS = ["Accounting", "Advocacy", "Agriculture", "AgriTech", "AI", "Animation", "Arts organisation", "Software Dev"];

// 備用模擬數據（當 API 無法連接時使用）
const MOCK_MARKERS = [
  { id: "1", name: "2degrees Hamilton", lat: -37.788, lng: 175.282, aoe: "Telecommunications", tags: ["Digital inclusion"] },
  { id: "2", name: "A1dezine Hamilton", lat: -37.782, lng: 175.275, aoe: "Software Dev", tags: ["Industry pathway"] },
  { id: "3", name: "AgriSmart HQ", lat: -37.795, lng: 175.290, aoe: "AgriTech", tags: ["Pastoral care"] },
  { id: "4", name: "Waikato Tech Hub", lat: -37.785, lng: 175.270, aoe: "AI", tags: ["Digital equity"] },
];

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aoe: string;
  tags: string[];
}

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAoe, setActiveAoe] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(true);
  const [markerError, setMarkerError] = useState<string | null>(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // 從 Xano API 獲取地圖標記數據
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        setIsLoadingMarkers(true);
        setMarkerError(null);
        const data = await getMapMarkers();
        
        // 將 Xano 數據轉換為地圖標記格式
        const formattedMarkers: MapMarker[] = data
          .map((org: any) => {
            // 支持多種經緯度字段格式
            const lat = org.latitude || org.lat || (org as any).location?.latitude;
            const lng = org.longitude || org.lng || (org as any).location?.longitude;
            
            // 轉換為數字
            const latNum = lat ? Number(lat) : null;
            const lngNum = lng ? Number(lng) : null;
            
            // 只處理有效的經緯度
            if (!latNum || !lngNum || isNaN(latNum) || isNaN(lngNum)) {
              return null;
            }
            
            // 處理 expertise（可能是字符串或數組）
            const expertise = org.expertise || '';
            const expertiseArray = Array.isArray(expertise) 
              ? expertise 
              : (typeof expertise === 'string' && expertise.trim() 
                  ? expertise.split(',').map((e: string) => e.trim()).filter((e: string) => e.length > 0)
                  : []);
            
            // 處理 impactArea（可能是字符串或數組）
            const impactArea = org.impactArea || org.impact_area || '';
            const impactAreaArray = Array.isArray(impactArea)
              ? impactArea
              : (typeof impactArea === 'string' && impactArea.trim() 
                  ? impactArea.split(',').map((i: string) => i.trim()).filter((i: string) => i.length > 0)
                  : []);
            
            return {
              id: String(org.id || ''),
              name: org.name || '',
              lat: latNum,
              lng: lngNum,
              aoe: expertiseArray[0] || '',
              tags: impactAreaArray,
            };
          })
          .filter((marker): marker is MapMarker => marker !== null);
        
        setMarkers(formattedMarkers);
      } catch (error: any) {
        console.error('獲取地圖標記失敗:', error);
        const errorMessage = error.message || '無法載入地圖標記';
        setMarkerError(errorMessage);
        
        // 如果是速率限制錯誤，顯示更友好的訊息
        if (errorMessage.includes('速率限制') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          setMarkerError('API 請求過於頻繁，請稍後再試。目前使用模擬數據顯示。');
        }
        
        // 如果 API 失敗，使用模擬數據作為備用
        setMarkers(MOCK_MARKERS);
      } finally {
        setIsLoadingMarkers(false);
      }
    };

    fetchMarkers();
  }, []);

  // Filter Logic
  const filteredMarkers = useMemo(() => {
    return markers.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAoe = activeAoe.length === 0 || activeAoe.includes(m.aoe);
      const matchesTag = activeTags.length === 0 || m.tags.some(t => activeTags.includes(t));
      return matchesSearch && matchesAoe && matchesTag;
    });
  }, [searchQuery, activeAoe, activeTags]);

  const toggleTag = (label: string) => {
    setActiveTags(prev => prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]);
  };

  return (
    <div className="pt-28 pb-0 min-h-screen bg-white flex flex-col">
      <div className="container mx-auto px-4 max-w-6xl flex-grow">
        <h1 className="text-[#3B3469] text-4xl font-extrabold text-center mb-10 tracking-tight">Ecosystem Map</h1>
        
        {/* Top Filter Tags */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {TAGS.map((tag) => (
            <button 
              key={tag.label}
              onClick={() => toggleTag(tag.label)}
              className={`${tag.color} px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all ${activeTags.includes(tag.label) ? `border-[#3B3469] ring-2 ring-[#3B3469]/10` : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Search & AoE Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#3B3469] transition-colors" />
            <input 
              type="text"
              placeholder="Search for organisation OR contact person"
              className="w-full bg-[#F3F4F6] border-none rounded-2xl pl-14 pr-6 py-4 text-sm focus:ring-2 focus:ring-[#3B3469]/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <AoeDropdown selected={activeAoe} onChange={setActiveAoe} />
        </div>

        {/* Map Container */}
        <div className="w-full h-[600px] bg-gray-100 rounded-[32px] overflow-hidden border border-gray-100 shadow-2xl relative mb-20 isolation-isolate">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={HAMILTON_CENTER}
              zoom={13}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: true,
                scaleControl: true,
                streetViewControl: true,
                rotateControl: true,
                fullscreenControl: true,
              }}
            >
              <MarkerClusterer>
                {(clusterer) => (
                  <>
                    {filteredMarkers.map((marker) => (
                      <Marker
                        key={marker.id}
                        position={{ lat: marker.lat, lng: marker.lng }}
                        clusterer={clusterer}
                        onClick={() => setSelectedPlace(marker)}
                      />
                    ))}
                  </>
                )}
              </MarkerClusterer>

              {selectedPlace && (
                <InfoWindow
                  position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                  onCloseClick={() => setSelectedPlace(null)}
                >
                  <div className="p-2 max-w-[200px]">
                    <h3 className="font-bold text-[#3B3469] text-sm mb-1">{selectedPlace.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{selectedPlace.aoe}</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPlace.tags.map((t: string) => (
                        <span key={t} className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded font-bold uppercase">{t}</span>
                      ))}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
               {/* =========================================================================
                   【同事注意 / FOR COLLEAGUE】
                   中文：在没有填入真实 API Key 时，这里会显示占位图。请在上方 GOOGLE_MAPS_API_KEY 处填入密钥。
                   English: This placeholder shows when no real API Key is provided. Please insert the key in GOOGLE_MAPS_API_KEY above.
                   ========================================================================= */}
               <div className="w-20 h-20 bg-[#3B3469]/10 rounded-full flex items-center justify-center animate-pulse">
                  <MapPin className="w-10 h-10 text-[#3B3469]/40" />
               </div>
               <p className="text-[#3B3469]/40 font-bold text-lg uppercase tracking-widest">Map Loading...</p>
               <p className="text-xs text-gray-400">Please provide a Google Maps API Key to see the live map.</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Feedback Section */}
      <section className="bg-[#A399D8] py-20">
        <div className="container mx-auto px-4">
           <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="text-left space-y-4">
                <h2 className="text-[#3B3469] text-3xl font-extrabold tracking-tight">Did you spot an error?</h2>
                <p className="text-[#3B3469]/80 text-sm md:text-base max-w-lg">If you&apos;ve spotted an error in the database, please contact us and we&apos;ll correct it ASAP!</p>
             </div>
             <Link 
               href="/contact" 
               className="bg-[#3B3469] text-white px-10 py-4 rounded-full font-bold hover:bg-[#2D2852] transition-all whitespace-nowrap shadow-lg"
             >
               Contact us
             </Link>
           </div>
        </div>
      </section>
    </div>
  );
}

function AoeDropdown({ selected, onChange }: { selected: string[], onChange: (val: string[]) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-10 px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-[#3B3469] min-w-[200px] shadow-sm hover:border-[#3B3469]/30 transition-all"
      >
        AoE {selected.length > 0 && `(${selected.length})`}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <input 
              type="text" 
              placeholder="Search"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[250px] overflow-y-auto">
            {AOE_OPTIONS.filter(o => o.toLowerCase().includes(search.toLowerCase())).map(opt => (
              <div 
                key={opt}
                onClick={() => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])}
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span className={`text-sm ${selected.includes(opt) ? "font-bold text-[#3B3469]" : "text-[#1E1B4B]/80"}`}>{opt}</span>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selected.includes(opt) ? "bg-[#3B3469] border-[#3B3469]" : "border-gray-200 bg-gray-100"}`}>
                  {selected.includes(opt) && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
