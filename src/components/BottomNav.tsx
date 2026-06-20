'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Activity, ShieldAlert, MessageSquare, Heart, Settings } from 'lucide-react';

const MAIN_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/pulseline', label: 'PulseLine', icon: Activity },
  { href: '/voicebox', label: 'Complaints', icon: MessageSquare },
  { href: '/aiddrop', label: 'Blood', icon: Heart },
];

const MORE_ITEMS = [
  { href: '/admin', label: 'Admin Panel', icon: Settings },
];


export default function BottomNav() {
  const pathname = usePathname();
  
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isAdminRoute = pathname?.startsWith('/admin');
  if (isAdminRoute) return null;

  return (
    <>
      {/* Bottom Nav Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E4E7EC] z-40 px-2 flex items-center justify-around select-none">
        {MAIN_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors ${
                isActive ? 'text-[#D72638]' : 'text-[#9AA0AD]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium mt-1 tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors ${
            isMoreOpen ? 'text-[#D72638]' : 'text-[#9AA0AD]'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-1 tracking-tight">More</span>
        </button>
      </div>

      {/* More Sheet Overlay */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-50 transition-opacity animate-in fade-in duration-200">
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl border-t border-[#E4E7EC] p-4 pb-8 max-h-[75vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-[#E4E7EC] mb-4">
              <span className="font-bold text-base text-[#111318]">More</span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-full text-[#5A6072] hover:bg-[#F7F8FA]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MORE_ITEMS.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? 'border-[#D72638] bg-[#D72638]/5 text-[#D72638] font-semibold'
                        : 'border-[#E4E7EC] hover:bg-[#F7F8FA] text-[#5A6072] hover:text-[#111318]'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-[#D72638]' : 'text-[#5A6072]'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}