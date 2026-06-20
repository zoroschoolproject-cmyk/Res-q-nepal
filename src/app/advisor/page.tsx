'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import UserAuthGuard from '@/components/UserAuthGuard';
import { Users, Search, MessageSquare, ClipboardList, HelpCircle, X, CheckCircle, Clock } from 'lucide-react';
import { formatNPT } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function AdvisorPageContent() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // SWR Fetching
  const { data: advisors = [], isLoading: advisorsLoading } = useSWR('/api/advisors', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });
  const { data: requests = [], isLoading: requestsLoading, mutate: mutateRequests } = useSWR('/api/advisors/requests', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  // Modal State
  const [selectedAdvisor, setSelectedAdvisor] = useState<any | null>(null);
  const [queryMessage, setQueryMessage] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('resq_user_session');
    if (session) {
      try {
        setCurrentUser(JSON.parse(session));
      } catch (e) {
        setCurrentUser(null);
      }
    }
  }, []);

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdvisor || !queryMessage.trim()) return;
    setSubmitLoading(true);
    setSuccessMessage(null);

    const payload = {
      user_id: currentUser?.id || null,
      advisor_id: selectedAdvisor.id,
      message: queryMessage,
    };

    try {
      const res = await fetch('/api/advisors/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMessage('Your request has been submitted successfully! The expert will contact you shortly.');
        setQueryMessage('');
        mutateRequests();
        setTimeout(() => {
          setSelectedAdvisor(null);
          setSuccessMessage(null);
        }, 3000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit advice request');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter out inactive advisors and apply search query
  const filteredAdvisors = advisors.filter((a: any) => {
    const isActive = a.is_active === 1;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.bio && a.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    return isActive && matchesSearch;
  });

  // Filter requests to show only the current user's requests
  const myRequests = requests.filter((r: any) => r.user_id === currentUser?.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-50 text-[#D97706] border-yellow-200';
      case 'Approved':
        return 'bg-green-50 text-[#16A34A] border-green-200';
      case 'Rejected':
        return 'bg-red-50 text-[#D72638] border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full select-none animate-in fade-in duration-200">
      <title>Expert Advisors — ResQ Nepal</title>

      {/* Header section */}
      <section className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-[#111318] flex items-center gap-2">
          <Users className="h-5.5 w-5.5 text-[#D72638]" /> Emergency Expert Advisor Panel
        </h1>
        <p className="text-xs text-[#5A6072]">
          Consult verified professional advisors in medical emergency, seismic safety structural engineering, and disaster management.
        </p>
      </section>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left/Center Area: Advisors Registry */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9AA0AD]">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search experts by specialty, name, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E4E7EC] rounded-lg pl-10 pr-4 py-2 text-xs text-[#111318] focus:outline-none focus:border-[#1B4FD8]"
            />
          </div>

          {advisorsLoading ? (
            <p className="text-center py-12 text-xs text-[#9AA0AD] italic">Loading registered experts...</p>
          ) : filteredAdvisors.length === 0 ? (
            <p className="text-center py-12 text-xs text-[#9AA0AD] italic">No active advisors match search query.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredAdvisors.map((a: any) => (
                <div
                  key={a.id}
                  className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:translate-y-[-1px] transition-all flex flex-col sm:flex-row gap-4"
                >
                  {/* Photo or Initials Bubble */}
                  <div className="shrink-0 flex items-start">
                    {a.photo_path ? (
                      <img
                        src={a.photo_path}
                        alt={a.name}
                        className="w-16 h-16 rounded-full object-cover border border-[#E4E7EC]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%239AA0AD" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#F7F8FA] border border-[#E4E7EC] flex items-center justify-center text-[#9AA0AD] font-mono text-lg font-bold">
                        {a.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Profile info details */}
                  <div className="flex-1 flex flex-col gap-2.5">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-sm text-[#111318]">{a.name}</h3>
                        <span className="text-[10px] font-mono text-[#D72638] font-bold uppercase tracking-wider mt-0.5">
                          {a.specialization}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#111318] block">NPR {a.fee.toLocaleString()}</span>
                        <span className="text-[9px] text-[#9AA0AD] font-mono block">Consultation fee</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#5A6072] leading-relaxed">
                      {a.bio || 'No profile description available.'}
                    </p>

                    <div className="flex justify-between items-center pt-2 border-t border-[#E4E7EC] mt-1">
                      <span className="text-[10px] font-mono text-[#9AA0AD] font-semibold">
                        Contact: {a.contact || 'Registered through ResQ'}
                      </span>
                      <button
                        onClick={() => setSelectedAdvisor(a)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D72638] hover:bg-[#D72638]/95 text-white font-bold text-xs rounded-md shadow-sm transition-colors cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Request Advice
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Area: User Queries Log List */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-mono font-bold text-[#9AA0AD] uppercase tracking-wider flex items-center gap-1.5 px-1">
            <ClipboardList className="h-4.5 w-4.5 text-[#D72638]" /> My Consultations
          </h2>

          <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col gap-4 min-h-[300px]">
            {requestsLoading ? (
              <p className="text-center py-12 text-xs text-[#9AA0AD] italic">Loading requests history...</p>
            ) : myRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[#9AA0AD] italic gap-2 h-full">
                <HelpCircle className="h-8 w-8 text-[#9AA0AD]/60" />
                <p className="text-xs">No advice requests lodged yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px]">
                {myRequests.map((req: any) => (
                  <div key={req.id} className="text-xs border-l-2 border-[#D72638] pl-3 py-1 bg-[#F7F8FA]/50 p-2.5 rounded-r-lg border border-[#E4E7EC] border-l-0 flex flex-col gap-2">
                    <div className="flex justify-between items-center font-mono text-[9px] text-[#9AA0AD]">
                      <span>AR-{String(req.id).padStart(4, '0')}</span>
                      <span>{formatNPT(req.created_at)}</span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#111318]">{req.advisor_name || 'Expert'}</span>
                      <span className="text-[10px] text-[#5A6072] font-semibold">{req.advisor_specialization}</span>
                    </div>

                    <p className="text-[11px] text-[#5A6072] italic line-clamp-2" title={req.message}>
                      &ldquo;{req.message}&rdquo;
                    </p>

                    <div className="flex justify-between items-center pt-1 border-t border-[#E4E7EC]/60 mt-1">
                      <span className="text-[9px] text-[#9AA0AD] font-mono">Status:</span>
                      <span className={`px-2 py-0.5 border rounded-full text-[9px] font-mono font-semibold ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* consultation Request Form Modal */}
      {selectedAdvisor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-lg max-w-sm w-full p-6 relative animate-in scale-in duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-[#E4E7EC] mb-4">
              <h3 className="font-bold text-sm text-[#111318] flex items-center gap-1.5">
                Advice: {selectedAdvisor.name}
              </h3>
              <button
                onClick={() => setSelectedAdvisor(null)}
                className="p-1 rounded-full text-[#5A6072] hover:bg-[#F7F8FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {successMessage ? (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                <Clock className="h-10 w-10 text-amber-500 animate-pulse" />
                <p className="text-xs font-semibold text-[#111318] leading-relaxed">{successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleConsultSubmit} className="flex flex-col gap-4">
                <div className="bg-[#F7F8FA] border border-[#E4E7EC] rounded-lg p-3 text-xs leading-relaxed text-[#5A6072]">
                  <span className="font-bold text-[#111318] block mb-0.5">{selectedAdvisor.specialization}</span>
                  Consultation Fee: <span className="font-bold text-[#111318]">NPR {selectedAdvisor.fee.toLocaleString()}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#111318]">Consultation Query / Message</label>
                  <textarea
                    placeholder="Describe your query or structural building hazard, medical history, or emergency situation details..."
                    rows={5}
                    value={queryMessage}
                    onChange={(e) => setQueryMessage(e.target.value)}
                    required
                    className="bg-white border border-[#E4E7EC] rounded-md px-3 py-2 text-xs focus:outline-none resize-none font-sans leading-relaxed text-[#111318]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full h-10 bg-[#D72638] hover:bg-[#D72638]/95 text-white font-bold text-xs rounded-md shadow-sm transition-colors mt-2"
                >
                  {submitLoading ? 'Submitting query...' : 'Submit Advice Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdvisorPage() {
  return (
    <UserAuthGuard>
      <AdvisorPageContent />
    </UserAuthGuard>
  );
}
