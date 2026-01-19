"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronDown, Check, ExternalLink, X } from "lucide-react";

// --- Mock Data Types ---
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

// =========================================================================
// 【同事注意 / FOR COLLEAGUE】
// 中文：这里是模拟数据。你需要将此处替换为从 Airtable API 获取的真实数据。
// English: This is mock data. You need to replace this with real data fetched from Airtable API.
// =========================================================================
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

// =========================================================================
// 【同事注意 / FOR COLLEAGUE】
// 中文：这里是筛选器的选项。如果 Airtable 里的分类有变动，请同步更新此处，或改为从 API 动态获取。
// English: These are filter options. If categories in Airtable change, please update here or fetch them dynamically via API.
// =========================================================================
const FILTER_OPTIONS = {
  expertise: ["Accounting", "Advocacy", "Agriculture", "AgriTech", "AI", "Animation", "Arts organisation", "ISP", "Retail", "Telecommunications", "Web development", "SaaS"],
  entityType: ["Community", "Connector/Enabler", "Corporate", "Council", "Education", "Energy"],
  impactArea: ["Digital equity", "Digital inclusion", "Industry pathway", "Internship pathway", "Pastoral care"]
};

export default function DatabasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedEntityType, setSelectedEntityType] = useState<string[]>([]);
  const [selectedImpactArea, setSelectedImpactArea] = useState<string[]>([]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return MOCK_DATA.filter(item => {
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
  }, [searchQuery, selectedExpertise, selectedEntityType, selectedImpactArea]);

  return (
    <div className="pt-32 pb-24 bg-[#F9FAFB] min-h-screen">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="text-center mb-12">
          <h1 className="text-[#3B3469] text-3xl font-extrabold tracking-tight mb-8">Ecosystem Directory</h1>
          
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
            options={FILTER_OPTIONS.expertise} 
            selected={selectedExpertise} 
            onChange={setSelectedExpertise} 
          />
          <FilterDropdown 
            label="Type of Entity" 
            options={FILTER_OPTIONS.entityType} 
            selected={selectedEntityType} 
            onChange={setSelectedEntityType} 
          />
          <FilterDropdown 
            label="Impact Area" 
            options={FILTER_OPTIONS.impactArea} 
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

        {/* Results Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-[#1E1B4B] font-bold text-[10px] uppercase tracking-[0.1em]">
                  <th className="px-4 py-4">Organisation Name</th>
                  <th className="px-4 py-4">Expertise</th>
                  <th className="px-4 py-4">Contact Person</th>
                  <th className="px-4 py-4">Title/role</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Contact - Phone</th>
                  <th className="px-4 py-4">Website</th>
                  <th className="px-4 py-4">Address</th>
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
                    <td className="px-4 py-1.5 text-[10px] text-gray-400 leading-tight max-w-[180px]">
                      <Link 
                        href={`/map?address=${encodeURIComponent(item.address)}&id=${item.id}`}
                        className="hover:text-[#3B3469] hover:underline transition-colors"
                      >
                        {item.address}
                      </Link>
                      {/* =========================================================================
                          【同事注意 / FOR COLLEAGUE】
                          中文：点击地址会跳转到地图页面。你需要在地图页面 (/map) 编写逻辑，
                          根据 URL 中的 address 或 id 参数，自动定位并弹出该组织的标记。
                          English: Clicking the address links to the map page. You need to implement 
                          logic in the map page (/map) to auto-center and open the info window 
                          based on the 'address' or 'id' URL parameter.
                          ========================================================================= */}
                    </td>
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
              Opt Out Now
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
