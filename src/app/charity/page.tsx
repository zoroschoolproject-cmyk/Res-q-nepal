'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Coins, Heart, Calendar, DollarSign, Award, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';
import UserAuthGuard from '@/components/UserAuthGuard';
import { formatNPT } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CharityPage() {
  const [donateCampId, setDonateCampId] = useState<number | null>(null);
  
  // Submit donation states
  const [donorName, setDonorName] = useState('');
  const [donateAmount, setDonateAmount] = useState('');
  const [donateMessage, setDonateMessage] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  const [donateSuccess, setDonateSuccess] = useState(false);
  const [donateError, setDonateError] = useState<string | null>(null);

  // Expanded states
  const [showPastCampaigns, setShowPastCampaigns] = useState(false);

  // Fetch active campaigns
  const { data: activeCampaigns = [], isLoading: activeLoading, mutate: mutateActive } = useSWR('/api/charity', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });
  // Fetch archived campaigns (only if expanded)
  const { data: pastCampaigns = [], isLoading: pastLoading } = useSWR(
    showPastCampaigns ? '/api/charity?archived=true' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );

  const handleDonate = async (e: React.FormEvent, campId: number) => {
    e.preventDefault();
    setIsDonating(true);
    setDonateSuccess(false);
    setDonateError(null);

    try {
      const res = await fetch(`/api/charity/${campId}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_name: donorName,
          amount: donateAmount,
          message: donateMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to lodge donation');
      }

      setDonateSuccess(true);
      setDonorName('');
      setDonateAmount('');
      setDonateMessage('');
      setDonateCampId(null);
      mutateActive(); // Refresh active campaigns list
    } catch (err: any) {
      setDonateError(err.message || 'Error processing donation.');
    } finally {
      setIsDonating(false);
    }
  };

  return (
    <UserAuthGuard>
      <div className="flex flex-col gap-10 w-full animate-in fade-in duration-200">
        <title>Charity — ResQ Nepal</title>

      {/* Header */}
      <section className="flex flex-col gap-1.5">
        <h1 className="text-xl font-bold text-[#111318] tracking-tight">Charity Fund</h1>
        <p className="text-xs text-[#5A6072] leading-relaxed">
          Fund community-driven search and rescue networks, support local medical relief Chapters, or sponsor winter blanket distribution drives.
        </p>
      </section>

      {/* Active Campaigns */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-mono font-bold text-[#9AA0AD] uppercase tracking-wider flex items-center gap-1.5">
          <Heart className="h-4 w-4 text-[#D72638]" /> Active Charity Campaigns
        </h2>

        {activeLoading ? (
          <p className="text-center py-12 text-xs text-[#9AA0AD] italic">Loading active campaigns...</p>
        ) : activeCampaigns.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#E4E7EC] rounded-xl text-xs text-[#9AA0AD] italic shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            "No active campaigns at this time"
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeCampaigns.map((camp: any) => {
              const isSelected = donateCampId === camp.id;
              const progress = Math.min(100, Math.round((camp.raised / camp.target) * 100));
              
              // Top Donors (already sorted by amount DESC from API)
              const topDonors = camp.donations?.slice(0, 3) || [];

              return (
                <div
                  key={camp.id}
                  className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col justify-between gap-5"
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-extrabold text-sm text-[#111318]">{camp.title}</h3>
                      <span className="text-[10px] font-mono bg-green-50 border border-green-200 text-green-700 px-2.5 py-0.5 rounded-full shrink-0">
                        {camp.is_active ? 'Active' : 'Completed'}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A6072] leading-relaxed">
                      {camp.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="w-full bg-[#E4E7EC] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#D72638] h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#9AA0AD]">
                      <span>Raised: NPR {camp.raised.toLocaleString()}</span>
                      <span>Target: NPR {camp.target.toLocaleString()} ({progress}%)</span>
                    </div>
                  </div>

                  {/* Leaderboard (Top Donors list) */}
                  <div className="bg-[#F7F8FA] rounded-lg p-3 border border-[#E4E7EC]">
                    <span className="text-[9px] font-mono font-bold text-[#9AA0AD] uppercase block mb-2">
                      🏆 Top Donors Leaderboard
                    </span>
                    {topDonors.length === 0 ? (
                      <span className="text-[10px] text-[#9AA0AD] italic">No donations registered yet. Be the first!</span>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {topDonors.map((d: any, idx: number) => (
                          <div key={d.id} className="flex justify-between items-center text-[11px] text-[#5A6072]">
                            <span className="font-medium flex items-center gap-1">
                              <span className="text-xs">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                              {d.donor_name}
                            </span>
                            <span className="font-bold text-[#111318] font-mono">NPR {d.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Campaign Footer and Action Button */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] text-[#9AA0AD] font-mono border-t border-[#E4E7EC] pt-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> End Date: {camp.end_date || 'N/A'}
                      </span>
                    </div>

                    {camp.is_active && (
                      <div className="mt-1">
                        {isSelected ? (
                          /* Donation Inline Form */
                          <form
                            onSubmit={(e) => handleDonate(e, camp.id)}
                            className="bg-[#F7F8FA] border border-[#E4E7EC] rounded-lg p-4 flex flex-col gap-3 animate-in fade-in duration-150"
                          >
                            <div className="flex justify-between items-center pb-2 border-b border-[#E4E7EC]">
                              <span className="font-bold text-xs text-[#111318] flex items-center gap-1">
                                <Award className="h-4 w-4 text-[#D72638]" /> Support Relief
                              </span>
                              <button
                                type="button"
                                onClick={() => setDonateCampId(null)}
                                className="text-[10px] text-[#5A6072] hover:text-[#D72638]"
                              >
                                Close
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-[#111318]">Your Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Rita Adhikari"
                                  value={donorName}
                                  onChange={(e) => setDonorName(e.target.value)}
                                  required
                                  className="bg-white border border-[#E4E7EC] rounded-md px-2 py-1 text-xs focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-[#111318]">Amount (NPR)</label>
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="e.g. 1000"
                                  value={donateAmount}
                                  onChange={(e) => setDonateAmount(e.target.value)}
                                  required
                                  className="bg-white border border-[#E4E7EC] rounded-md px-2 py-1 text-xs focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-[#111318]">Personal Message (Optional)</label>
                              <input
                                type="text"
                                placeholder="Well wishes or local support notes..."
                                value={donateMessage}
                                onChange={(e) => setDonateMessage(e.target.value)}
                                className="bg-white border border-[#E4E7EC] rounded-md px-2 py-1 text-xs focus:outline-none"
                              />
                            </div>

                            {donateError && (
                              <p className="text-[10px] text-[#DC2626] font-semibold">{donateError}</p>
                            )}

                            <button
                              type="submit"
                              disabled={isDonating}
                              className="w-full h-8 bg-[#D72638] hover:bg-[#D72638]/95 text-white font-bold text-[10px] rounded-md transition-colors"
                            >
                              {isDonating ? 'Processing...' : 'Confirm Donation'}
                            </button>
                          </form>
                        ) : (
                          <button
                            onClick={() => {
                              setDonateCampId(camp.id);
                              setDonateSuccess(false);
                            }}
                            className="w-full py-2 bg-[#D72638] hover:bg-[#D72638]/95 text-white font-bold text-xs rounded-md shadow-sm transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Coins className="h-4 w-4" /> Donate Now
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Past Campaigns Section (Collapsed) */}
      <section className="mt-4 flex flex-col gap-4">
        <button
          onClick={() => setShowPastCampaigns(!showPastCampaigns)}
          className="flex items-center justify-between p-4 bg-white border border-[#E4E7EC] rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:bg-[#F7F8FA] transition-colors text-left"
        >
          <span className="font-extrabold text-sm text-[#111318] flex items-center gap-2">
            📊 Past Campaigns Archive
          </span>
          {showPastCampaigns ? <ChevronUp className="h-5 w-5 text-[#5A6072]" /> : <ChevronDown className="h-5 w-5 text-[#5A6072]" />}
        </button>

        {showPastCampaigns && (
          <div className="flex flex-col gap-4 bg-[#F7F8FA] border border-[#E4E7EC] rounded-xl p-4 animate-in slide-in-from-top-3 duration-250">
            {pastLoading ? (
              <p className="text-center py-6 text-xs text-[#9AA0AD] italic">Loading archived campaigns...</p>
            ) : pastCampaigns.length === 0 ? (
              <p className="text-center py-6 text-xs text-[#9AA0AD] italic">No archived campaigns found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastCampaigns.map((camp: any) => (
                  <div
                    key={camp.id}
                    className="bg-white border border-[#E4E7EC] rounded-lg p-4 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-xs text-[#111318]">{camp.title}</span>
                      <p className="text-[10px] text-[#5A6072] line-clamp-2 leading-relaxed">
                        {camp.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-0.5 shrink-0 text-right">
                      <span className="text-[9px] font-mono text-[#9AA0AD] uppercase">Final Raised</span>
                      <span className="font-bold text-xs text-[#16A34A] font-mono">
                        NPR {camp.raised.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
    </UserAuthGuard>
  );
}
