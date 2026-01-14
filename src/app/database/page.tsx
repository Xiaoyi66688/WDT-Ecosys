"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronDown, Check, ExternalLink, Mail, Phone, MapPin, X, Building2, Zap, Users, Loader2 } from "lucide-react";
import { getOrganizations, Organization } from "@/lib/xano-api";

// --- Data Types ---
interface Org {
  id: string;
  name: string;
  expertise: string[];
  contactPerson: string;
  role: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  entityType: string;
  impactArea: string[];
}

// 備用模擬數據（當 API 無法連接時使用）
const MOCK_DATA: Org[] = [
  {
    id: "1",
    name: "2degrees Centreplace",
    expertise: ["ISP", "Retail", "Telecommunications"],
    contactPerson: "",
    role: "",
    email: "",
    phone: "07 839 1783",
    website: "https://www.2degrees.nz/",
    address: "Shop 50 Victoria Street, Hamilton Central, Hamilton 3204",
    entityType: "Corporate",
    impactArea: ["Digital inclusion"]
  },
  {
    id: "2",
    name: "A1dezine Limited",
    expertise: ["Web development"],
    contactPerson: "",
    role: "",
    email: "info@a1dezine.co.nz",
    phone: "07 834 6666",
    website: "https://www.a1dezine.co.nz/",
    address: "130 Rostrevor Street, Hamilton Central, Hamilton 3204",
    entityType: "Corporate",
    impactArea: ["Industry pathway"]
  },
  {
    id: "3",
    name: "Adroit Creations",
    expertise: ["SaaS"],
    contactPerson: "Daniel Newman",
    role: "Director and Chief of Customer Experience",
    email: "",
    phone: "",
    website: "https://www.adroitcreations.com/",
    address: "Paeroa, Waikato, New Zealand",
    entityType: "Corporate",
    impactArea: ["Internship pathway"]
  },
  {
    id: "4",
    name: "AgriSmart",
    expertise: ["AgriTech"],
    contactPerson: "Imran Raza",
    role: "CEO and Founder of AgriSmart Software",
    email: "https://agrismart.co.nz/contact-us/",
    phone: "0800 110 172",
    website: "https://agrismart.co.nz/",
    address: "1 Melody Lane, Hamilton East, Hamilton 3216",
    entityType: "Corporate",
    impactArea: ["Pastoral care"]
  }
];


export default function DatabasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedEntityType, setSelectedEntityType] = useState<string[]>([]);
  const [selectedImpactArea, setSelectedImpactArea] = useState<string[]>([]);
  const [organizations, setOrganizations] = useState<Org[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 從 Xano API 獲取數據
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getOrganizations();
        console.log('從 Xano 獲取的原始數據:', data);
        console.log('數據數量:', data.length);
        
        // 將 Xano 數據轉換為前端需要的格式
        // 支持 Xano 資料庫的下劃線字段名稱和前端期望的駝峰字段名稱
        const formattedData: Org[] = data.map((org: any) => {
          // 處理 expertise（可能是字符串，需要轉換為數組）
          const expertise = org.expertise || '';
          const expertiseArray = Array.isArray(expertise) 
            ? expertise 
            : (typeof expertise === 'string' && expertise.trim() 
                ? expertise.split(',').map((e: string) => e.trim()).filter((e: string) => e.length > 0)
                : []);
          
          // 處理 impactArea（可能是字符串，需要轉換為數組）
          // 支持多個字段：impact_area, other_impact_areas, pastoral_care, industry_pathway, internship_pathway
          const impactAreaSources = [
            org.impact_area,
            org.other_impact_areas,
            org.pastoral_care,
            org.industry_pathway,
            org.internship_pathway
          ].filter(Boolean);
          
          const impactAreaArray: string[] = [];
          impactAreaSources.forEach((source: any) => {
            if (Array.isArray(source)) {
              impactAreaArray.push(...source);
            } else if (typeof source === 'string' && source.trim()) {
              impactAreaArray.push(...source.split(',').map((i: string) => i.trim()).filter((i: string) => i.length > 0));
            }
          });
          // 去重
          const uniqueImpactArea = Array.from(new Set(impactAreaArray));
          
          return {
            id: String(org.id || ''),
            name: org.name || '',
            expertise: expertiseArray,
            // 支持 contactPerson 和 contact_person
            contactPerson: org.contactPerson || org.contact_person || '',
            // 支持 role 和 position
            role: org.role || org.position || '',
            // 支持 email 和 email_id
            email: org.email || org.email_id || '',
            phone: org.phone || '',
            website: org.website || '',
            // 支持 address 和 physical_address
            address: org.address || org.physical_address || '',
            // entityType 可能不存在，使用空字符串
            entityType: org.entityType || org.entity_type || '',
            impactArea: uniqueImpactArea,
          };
        });
        
        console.log('格式化後的數據:', formattedData);
        console.log('格式化後的數據數量:', formattedData.length);
        setOrganizations(formattedData);
      } catch (err: any) {
        console.error('獲取組織數據失敗:', err);
        setError(err.message || '無法載入數據');
        // 如果 API 失敗，使用模擬數據作為備用
        setOrganizations(MOCK_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 從組織數據中提取所有唯一的篩選選項
  const filterOptions = useMemo(() => {
    const expertiseSet = new Set<string>();
    const entityTypeSet = new Set<string>();
    const impactAreaSet = new Set<string>();

    organizations.forEach(org => {
      org.expertise?.forEach(exp => expertiseSet.add(exp));
      if (org.entityType) entityTypeSet.add(org.entityType);
      org.impactArea?.forEach(imp => impactAreaSet.add(imp));
    });

    return {
      expertise: Array.from(expertiseSet).sort(),
      entityType: Array.from(entityTypeSet).sort(),
      impactArea: Array.from(impactAreaSet).sort(),
    };
  }, [organizations]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return organizations.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesExpertise = selectedExpertise.length === 0 || 
                              selectedExpertise.some(exp => item.expertise.includes(exp));
      
      const matchesEntity = selectedEntityType.length === 0 || 
                           selectedEntityType.includes(item.entityType);
      
      const matchesImpact = selectedImpactArea.length === 0 || 
                           selectedImpactArea.some(imp => item.impactArea.includes(imp));

      return matchesSearch && matchesExpertise && matchesEntity && matchesImpact;
    });
  }, [organizations, searchQuery, selectedExpertise, selectedEntityType, selectedImpactArea]);

  return (
    <div className="pt-32 pb-24 bg-[#F9FAFB] min-h-screen">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="text-center mb-12">
          <h1 className="text-[#3B3469] text-3xl font-extrabold tracking-tight mb-8">Ecosystem Database</h1>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#3B3469] transition-colors" />
            <input 
              type="text"
              placeholder="Search for organisation OR contact person"
              className="w-full bg-white border border-gray-200 rounded-2xl pl-16 pr-6 py-5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B3469]/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 mb-10">
          <FilterDropdown 
            label="Area of Expertise" 
            options={filterOptions.expertise} 
            selected={selectedExpertise} 
            onChange={setSelectedExpertise} 
          />
          <FilterDropdown 
            label="Type of Entity" 
            options={filterOptions.entityType} 
            selected={selectedEntityType} 
            onChange={setSelectedEntityType} 
          />
          <FilterDropdown 
            label="Impact Area" 
            options={filterOptions.impactArea} 
            selected={selectedImpactArea} 
            onChange={setSelectedImpactArea} 
          />
          
          {/* Clear Filters */}
          {(selectedExpertise.length > 0 || selectedEntityType.length > 0 || selectedImpactArea.length > 0) && (
            <button 
              onClick={() => {
                setSelectedExpertise([]);
                setSelectedEntityType([]);
                setSelectedImpactArea([]);
              }}
              className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors px-4"
            >
              <X className="w-4 h-4" /> Clear all filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#3B3469] mx-auto mb-4" />
            <p className="text-gray-600">Loading data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 mb-6">
            <p className="text-yellow-800 text-sm">
              ⚠️ {error}。目前顯示備用數據。
            </p>
          </div>
        )}

        {/* Results Table */}
        {!isLoading && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-[#1E1B4B]/40 font-bold text-[10px] uppercase tracking-[0.1em]">
                  <th className="px-4 py-2 flex items-center gap-2"><Building2 className="w-3 h-3" /> Organisation Name</th>
                  <th className="px-4 py-2"><Zap className="w-3 h-3 inline mr-1.5" /> Expertise</th>
                  <th className="px-4 py-2"><Users className="w-3 h-3 inline mr-1.5" /> Contact Person</th>
                  <th className="px-4 py-2"><X className="w-3 h-3 inline mr-1.5 rotate-45" /> Title/role</th>
                  <th className="px-4 py-2"><Mail className="w-3 h-3 inline mr-1.5" /> Email</th>
                  <th className="px-4 py-2"><Phone className="w-3 h-3 inline mr-1.5" /> Contact - Phone</th>
                  <th className="px-4 py-2"><ExternalLink className="w-3 h-3 inline mr-1.5" /> Website</th>
                  <th className="px-4 py-2"><MapPin className="w-3 h-3 inline mr-1.5" /> Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group text-[13px]">
                    <td className="px-4 py-1.5 font-bold text-[#3B3469]">{item.name}</td>
                    <td className="px-4 py-1.5">
                      <div className="flex flex-wrap gap-1">
                        {item.expertise.map(exp => (
                          <span key={exp} className="bg-gray-100 text-gray-600 px-1.5 py-0 rounded-[4px] text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-1.5 text-[#1E1B4B]/70">{item.contactPerson || "-"}</td>
                    <td className="px-4 py-1.5 text-[11px] text-[#1E1B4B]/60 leading-tight max-w-[180px]">{item.role || "-"}</td>
                    <td className="px-4 py-1.5">
                      {item.email ? (
                        <a href={item.email.startsWith('http') ? item.email : `mailto:${item.email}`} target="_blank" rel="noopener noreferrer" className="text-[#3B3469]/60 hover:text-[#3B3469]">
                          {item.email.startsWith('http') ? <ExternalLink className="w-3.5 h-3.5" /> : item.email}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-1.5 text-[#1E1B4B]/70 whitespace-nowrap">{item.phone || "-"}</td>
                    <td className="px-4 py-1.5">
                      {item.website ? (
                        <a 
                          href={item.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[#3B3469]/60 hover:text-[#3B3469] underline text-[11px] flex items-center gap-1"
                        >
                          {item.website.replace('https://', '').replace('www.', '').split('/')[0]}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-1.5 text-[10px] text-gray-400 leading-tight max-w-[180px]">{item.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredData.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              No results found matching your search and filters.
            </div>
          )}
        </div>
        )}
      </div>

      {/* Opt Out CTA Section */}
      <section className="bg-[#A399D8] py-20 mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left space-y-4">
              <h2 className="text-[#3B3469] text-3xl font-extrabold tracking-tight">Don&apos;t want to be listed?</h2>
              <p className="text-[#3B3469]/80 text-sm md:text-base max-w-lg">
                If you want to be removed from the database, please let us know immediately and we&apos;ll get it sorted.
              </p>
            </div>
            <Link 
              href="/opt-out" 
              className="bg-[#3B3469] text-white px-10 py-4 rounded-full font-bold hover:bg-[#2D2852] transition-all whitespace-nowrap shadow-lg"
            >
              Opt Out Now!
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Custom Filter Dropdown Component ---
function FilterDropdown({ label, options, selected, onChange }: { 
  label: string, 
  options: string[], 
  selected: string[], 
  onChange: (val: string[]) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(item => item !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-6 py-3 bg-white border rounded-xl text-[13px] font-bold transition-all ${selected.length > 0 ? "border-[#3B3469] text-[#3B3469]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
      >
        {label} {selected.length > 0 && `(${selected.length})`}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] flex flex-col">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredOptions.map((opt) => (
              <div 
                key={opt}
                onClick={() => toggleOption(opt)}
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
