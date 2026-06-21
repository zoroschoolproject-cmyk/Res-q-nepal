'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Link2, Search, ExternalLink } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SafeLinkPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch links using SWR
  const { data: links = [], isLoading: linksLoading } = useSWR('/api/links', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  // Extract categories for filters dynamically
  const linkCategories = ['All', ...Array.from(new Set(links.map((l: any) => l.category)))];

  // Filtering Logic
  const filteredLinks = links.filter((l: any) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || l.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-200">
      <title>SafeLink — ResQ Nepal</title>

      {/* Header */}
      <section className="flex flex-col gap-1.5">
        <h1 className="text-xl font-bold text-[#111318] tracking-tight">SafeLink</h1>
        <p className="text-xs text-[#5A6072] leading-relaxed">
          Access official external disaster portals, river-level monitors, weather forecasting sites, and verified safety resources.
        </p>
      </section>

      {/* Sticky Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9AA0AD]">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search web resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E4E7EC] rounded-lg pl-10 pr-4 py-2 text-xs text-[#111318] placeholder-[#9AA0AD] focus:outline-none focus:border-[#1B4FD8]"
          />
        </div>

        {/* Category Filter dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 select-none">
          <span className="text-xs text-[#5A6072] font-semibold hidden md:inline">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-48 bg-white border border-[#E4E7EC] rounded-lg px-3 py-2 text-xs text-[#111318] focus:outline-none"
          >
            {linkCategories.map((c: any) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Info Links Section --- */}
      <section className="flex flex-col gap-4 animate-in fade-in duration-150">
        {linksLoading ? (
          <p className="text-center py-12 text-xs text-[#9AA0AD] italic">Loading links database...</p>
        ) : filteredLinks.length === 0 ? (
          <p className="text-center py-12 text-xs text-[#9AA0AD] italic bg-white border border-[#E4E7EC] rounded-xl">
            No matching links found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLinks.map((l: any) => (
              <div
                key={l.id}
                className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-150 flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] font-mono bg-[#1B4FD8]/10 text-[#1B4FD8] px-2.5 py-0.5 rounded-full uppercase tracking-tight">
                      {l.category}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-[#111318] mt-1 flex items-center gap-1.5">
                    <Link2 className="h-4 w-4 text-[#1B4FD8]" /> {l.name}
                  </h3>
                  <p className="text-xs text-[#5A6072] leading-relaxed mt-1">
                    {l.description}
                  </p>
                </div>
                
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 border border-[#E4E7EC] hover:border-[#1B4FD8] hover:bg-[#1B4FD8]/5 text-[#111318] font-bold text-xs rounded-md shadow-sm transition-colors w-fit"
                >
                  Visit Portal
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
