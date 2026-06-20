'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { ShieldCheck, Wifi, WifiOff, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import UserAuthGuard from '@/components/UserAuthGuard';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SafeShieldPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [expandedCompanyId, setExpandedCompanyId] = useState<number | null>(null);

  // Monitor online status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Fetch active insurance companies (only if online)
  const { data: companies = [], isLoading } = useSWR(
    isOnline ? '/api/insurance?active_only=true' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );

  const toggleExpand = (id: number) => {
    setExpandedCompanyId(expandedCompanyId === id ? null : id);
  };

  return (
    <UserAuthGuard>
      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
        <title>SafeShield — ResQ Nepal</title>

      {/* Header */}
      <section className="flex flex-col gap-1.5">
        <h1 className="text-xl font-bold text-[#111318] tracking-tight">SafeShield Insurance</h1>
        <p className="text-xs text-[#5A6072] leading-relaxed">
          Affiliated disaster relief, health, and property policies provided by local insurance groups.
        </p>
      </section>

      {/* Connection Status Banner */}
      {!isOnline ? (
        <div className="flex flex-col items-center justify-center text-center p-10 bg-red-50 border border-red-200 rounded-xl gap-4 max-w-md mx-auto w-full my-6">
          <span className="p-3 bg-red-100 text-[#DC2626] rounded-full">
            <WifiOff className="h-8 w-8" />
          </span>
          <div>
            <h3 className="font-extrabold text-[#111318] text-sm">Offline Mode Active</h3>
            <p className="text-xs text-[#5A6072] mt-2 leading-relaxed">
              This feature requires an active internet connection to browse policies, redirect to payment portals, and calculate referral commissions.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#9AA0AD]">
            *Reconnect to check rates.
          </span>
        </div>
      ) : (
        /* Online State UI */
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-[#16A34A] rounded-lg text-xs font-semibold">
            <Wifi className="h-4.5 w-4.5" />
            <span>Connected Online. Listing rates in real time.</span>
          </div>

          {isLoading ? (
            <p className="text-center py-12 text-xs text-[#9AA0AD] italic">Checking insurance registries...</p>
          ) : companies.length === 0 ? (
            <p className="text-center py-12 text-xs text-[#9AA0AD] italic bg-white border border-[#E4E7EC] rounded-xl">
              No insurance partners are listed at this time.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {companies.map((company: any) => {
                const isExpanded = expandedCompanyId === company.id;
                let plansList: any[] = [];
                try {
                  plansList = typeof company.plans === 'string' ? JSON.parse(company.plans) : company.plans || [];
                } catch (e) {}
                
                return (
                  <div
                    key={company.id}
                    className="bg-white border border-[#E4E7EC] rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden"
                  >
                    {/* Header Summary */}
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="w-12 h-12 rounded-xl bg-[#1B4FD8]/10 text-[#1B4FD8] flex items-center justify-center font-extrabold text-2xl select-none shadow-sm shrink-0">
                          🏢
                        </span>
                        <div className="flex flex-col">
                          <h3 className="font-extrabold text-sm text-[#111318]">{company.name}</h3>
                          <p className="text-xs text-[#5A6072] mt-1 leading-normal">
                            {company.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2.5 items-center shrink-0 self-end md:self-auto">
                        <button
                          onClick={() => toggleExpand(company.id)}
                          className="flex items-center gap-1 text-xs text-[#1B4FD8] hover:text-[#111318] font-bold transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              Hide Plans <ChevronUp className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              View Plans ({plansList.length}) <ChevronDown className="h-4 w-4" />
                            </>
                          )}
                        </button>
                        
                        <a
                          href={company.affiliate_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#1B4FD8] hover:bg-[#1B4FD8]/95 text-white font-bold text-xs rounded-md shadow-sm transition-colors"
                        >
                          Visit site
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Expandable Plans Section */}
                    {isExpanded && (
                      <div className="bg-[#F7F8FA] border-t border-[#E4E7EC] p-5 flex flex-col gap-4 animate-in slide-in-from-top-3 duration-200">
                        <h4 className="text-xs font-mono font-bold text-[#9AA0AD] uppercase tracking-wider">
                          Available Insurance Plans
                        </h4>
                        
                        {plansList.length === 0 ? (
                          <p className="text-xs text-[#9AA0AD] italic">No active sub-plans available.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plansList.map((plan: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-white border border-[#E4E7EC] rounded-lg p-4 shadow-sm flex flex-col justify-between gap-3"
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="font-bold text-xs text-[#111318]">{plan.name}</span>
                                    <span className="text-[10px] font-mono bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded-full font-bold">
                                      {plan.premium}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-[#9AA0AD]">
                                    Type: {plan.type}
                                  </span>
                                  <p className="text-[11px] text-[#5A6072] leading-normal mt-1">
                                    {plan.coverage}
                                  </p>
                                </div>

                                <a
                                  href={company.affiliate_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-fit px-3.5 py-1.5 bg-[#D72638] hover:bg-[#D72638]/95 text-white font-bold text-[10px] rounded-md shadow-sm transition-colors uppercase tracking-wider"
                                >
                                  Get Insured
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Revenue Disclaimer */}
          <footer className="text-center text-[10px] text-[#9AA0AD] leading-relaxed mt-6 border-t border-[#E4E7EC] pt-4 select-none">
            "ResQ Nepal is not responsible for any insurance plan terms. Please read all terms before purchasing."
          </footer>
        </div>
      )}
    </div>
    </UserAuthGuard>
  );
}
