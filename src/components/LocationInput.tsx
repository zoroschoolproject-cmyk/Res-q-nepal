'use client';

import { MapPin } from 'lucide-react';

export interface LocationData {
  locationText: string;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface LocationInputProps {
  value: LocationData;
  onChange: (data: LocationData) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationInput({ value, onChange, placeholder = "Search by location...", className = "" }: LocationInputProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9AA0AD]">
          <MapPin className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={value.locationText}
          onChange={(e) => onChange({ ...value, locationText: e.target.value })}
          className="w-full bg-white border border-[#E4E7EC] rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#111318] placeholder-[#9AA0AD] focus:outline-none focus:border-[#1B4FD8] focus:ring-1 focus:ring-[#1B4FD8] transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
        />
      </div>
    </div>
  );
}
