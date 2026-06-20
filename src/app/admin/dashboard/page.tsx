'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { ShieldAlert, MessageSquare, Heart, Plus, ClipboardList, Bell, Check } from 'lucide-react';
import { formatNPT } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CONTACT_CATEGORIES = ['Police', 'Fire Brigade', 'Medical', 'Disaster Management', 'Utility', 'Women & Child Safety', 'Mental Health'];

export default function AdminDashboardPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/admin/dashboard', fetcher, {
    refreshInterval: 8000, // refresh every 8s
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  // Modal open states
  const [modalType, setModalType] = useState<'contact' | 'notice' | null>(null);
  
  // Submit loading/success states
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states - Contact
  const [contactName, setContactName] = useState('');
  const [contactNum, setContactNum] = useState('');
  const [contactCat, setContactCat] = useState('Police');
  const [contactDesc, setContactDesc] = useState('');

  // Form states - Notice
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePinned, setNoticePinned] = useState(true);

  const resetForm = () => {
    setLoading(false);
    setMsg(null);
    setContactName('');
    setContactNum('');
    setContactDesc('');
    setNoticeTitle('');
    setNoticeContent('');
    setNoticePinned(true);
  };

  const handleOpenModal = (type: 'contact' | 'notice') => {
    resetForm();
    setModalType(type);
  };

  const handleCloseModal = () => {
    setModalType(null);
    resetForm();
  };

  // --- Submit Quick Contact ---
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          number: contactNum,
          category: contactCat,
          description: contactDesc,
        }),
      });

      if (!res.ok) throw new Error('Failed to add contact');
      
      setMsg({ type: 'success', text: 'Contact added successfully!' });
      mutate();
      setTimeout(handleCloseModal, 1500);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- Submit Quick Notice ---
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent,
          is_pinned: noticePinned,
        }),
      });

      if (!res.ok) throw new Error('Failed to post notice');

      setMsg({ type: 'success', text: 'Notice bulletin posted successfully!' });
      mutate();
      setTimeout(handleCloseModal, 1500);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      if (res.ok) {
        mutate();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D72638] border-t-transparent" />
      </div>
    );
  }

  const { stats = {}, activities = [], notifications = [] } = data || {};

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-yellow-50 text-[#D97706] border-yellow-200';
      case 'Under Review':
        return 'bg-blue-50 text-[#1B4FD8] border-blue-200';
      case 'Resolved':
        return 'bg-green-50 text-[#16A34A] border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-200">
      <title>Admin Dashboard — ResQ Nepal</title>

      {/* Header */}
      <section className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-[#111318] tracking-tight">Admin Dashboard</h1>
        <p className="text-xs text-[#5A6072]">
          Monitor reports, municipal complaints, active donor registries, and notice bulletins.
        </p>
      </section>

      {/* Stats Counter Rows */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Complaints */}
        <div className="bg-white border border-[#E4E7EC] p-4 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <span className="p-2 rounded-lg bg-[#1B4FD8]/10 text-[#1B4FD8]">
            <MessageSquare className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#9AA0AD] uppercase tracking-wider font-semibold">Open Complaints</span>
            <span className="text-lg font-bold text-[#111318]">{stats.openComplaints || 0}</span>
          </div>
        </div>

        {/* Active Donors */}
        <div className="bg-white border border-[#E4E7EC] p-4 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex items-center gap-3">
          <span className="p-2 rounded-lg bg-[#16A34A]/10 text-[#16A34A]">
            <Heart className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#9AA0AD] uppercase tracking-wider font-semibold">Active Donors</span>
            <span className="text-lg font-bold text-[#111318]">{stats.activeDonors || 0}</span>
          </div>
        </div>
      </section>

      {/* Quick Action Hub */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-mono font-bold text-[#9AA0AD] uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleOpenModal('contact')}
            className="flex items-center justify-between p-4 bg-white border border-[#E4E7EC] rounded-xl hover:bg-[#F7F8FA] transition-all duration-150 text-left shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-3">
              <span className="p-2 bg-[#D72638]/10 text-[#D72638] rounded-lg">
                <Plus className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-[#111318]">Add Contact</span>
                <span className="text-[10px] text-[#5A6072] mt-0.5">Quick add a PulseLine number</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleOpenModal('notice')}
            className="flex items-center justify-between p-4 bg-white border border-[#E4E7EC] rounded-xl hover:bg-[#F7F8FA] transition-all duration-150 text-left shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-3">
              <span className="p-2 bg-[#D97706]/10 text-[#D97706] rounded-lg">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-[#111318]">Post Notice</span>
                <span className="text-[10px] text-[#5A6072] mt-0.5">Broadcast an alert on Home page</span>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Activities Feed & Notifications logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activities list */}
        <section className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-xs font-mono font-bold text-[#9AA0AD] uppercase tracking-wider">
            Recent Activity Log (Latest 10)
          </h2>
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-x-auto">
            {activities.length === 0 ? (
              <p className="text-xs text-[#9AA0AD] italic text-center py-12">No recent system activities found.</p>
            ) : (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E4E7EC] text-[#9AA0AD] font-mono">
                    <th className="pb-3 pr-2">Type</th>
                    <th className="pb-3 pr-2">Action / Title</th>
                    <th className="pb-3 pr-2">Code</th>
                    <th className="pb-3 pr-2">Status</th>
                    <th className="pb-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC]">
                  {activities.map((act: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#F7F8FA] transition-colors">
                      <td className="py-3 pr-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          act.type === 'Report' ? 'bg-red-50 text-[#D72638]' : act.type === 'Complaint' ? 'bg-blue-50 text-[#1B4FD8]' : 'bg-green-50 text-[#16A34A]'
                        }`}>
                          {act.type}
                        </span>
                      </td>
                      <td className="py-3 pr-2 font-bold text-[#111318] max-w-[200px] truncate">{act.title}</td>
                      <td className="py-3 pr-2 font-mono font-semibold text-[#5A6072]">{act.code || 'N/A'}</td>
                      <td className="py-3 pr-2">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono ${getStatusBadgeColor(act.status)}`}>
                          {act.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[#9AA0AD]">{formatNPT(act.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Notifications log widget */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-mono font-bold text-[#9AA0AD] uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="h-4 w-4 text-[#D72638]" /> System Alert Alerts
          </h2>
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col gap-4 max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-[#9AA0AD] italic text-center py-12">No notifications logged.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {notifications.map((n: any) => (
                  <div
                    key={n.id}
                    className={`p-3 border rounded-lg transition-all flex flex-col gap-1 ${
                      !n.is_read ? 'bg-[#DBEAFE]/10 border-blue-100' : 'bg-white border-[#E4E7EC]'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] font-mono text-[#9AA0AD]">
                      <span>{n.type} Alert</span>
                      <span>{formatNPT(n.created_at, 'time')}</span>
                    </div>
                    <h4 className="font-bold text-xs text-[#111318] truncate mt-0.5">{n.title}</h4>
                    <p className="text-[10px] text-[#5A6072] leading-normal line-clamp-2">{n.message}</p>
                    
                    {!n.is_read && (
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="mt-2 text-[10px] font-semibold text-[#1B4FD8] hover:text-[#111318] flex items-center gap-0.5 transition-colors self-start"
                      >
                        <Check className="h-3.5 w-3.5" /> Mark read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>

      {/* --- QUICK ACTION MODALS --- */}

      {/* Add Contact Modal */}
      {modalType === 'contact' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-lg max-w-sm w-full p-6 relative animate-in scale-in duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-[#E4E7EC] mb-4">
              <h3 className="font-bold text-sm text-[#111318] flex items-center gap-1.5">
                <Plus className="h-5 w-5 text-[#D72638]" /> Add Emergency Contact
              </h3>
            </div>
            
            <form onSubmit={handleAddContact} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#111318]">Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bir Hospital Hotline"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  className="bg-white border border-[#E4E7EC] rounded-md px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#111318]">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 102, 01-xxxxxx"
                    value={contactNum}
                    onChange={(e) => setContactNum(e.target.value)}
                    required
                    className="bg-white border border-[#E4E7EC] rounded-md px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#111318]">Category</label>
                  <select
                    value={contactCat}
                    onChange={(e) => setContactCat(e.target.value)}
                    className="bg-white border border-[#E4E7EC] rounded-md px-3 py-1.5 text-xs focus:outline-none"
                  >
                    {CONTACT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#111318]">Short Description</label>
                <textarea
                  placeholder="When to call or location details..."
                  rows={2}
                  value={contactDesc}
                  onChange={(e) => setContactDesc(e.target.value)}
                  className="bg-white border border-[#E4E7EC] rounded-md px-3 py-1.5 text-xs focus:outline-none resize-none"
                />
              </div>

              {msg && (
                <p className={`text-[10px] font-semibold ${msg.type === 'success' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  {msg.text}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3 py-1.5 border border-[#E4E7EC] hover:bg-[#F7F8FA] rounded-md text-xs font-semibold text-[#5A6072]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-[#D72638] hover:bg-[#D72638]/95 text-white font-bold rounded-md text-xs"
                >
                  {loading ? 'Adding...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Notice Modal */}
      {modalType === 'notice' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-lg max-w-sm w-full p-6 relative animate-in scale-in duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-[#E4E7EC] mb-4">
              <h3 className="font-bold text-sm text-[#111318] flex items-center gap-1.5">
                <ClipboardList className="h-5 w-5 text-[#D97706]" /> Post Notice Bulletin
              </h3>
            </div>

            <form onSubmit={handleAddNotice} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#111318]">Notice Title</label>
                <input
                  type="text"
                  placeholder="e.g. Heavy Floods advisory"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  required
                  className="bg-white border border-[#E4E7EC] rounded-md px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#111318]">Bulletin Content</label>
                <textarea
                  placeholder="Details regarding landslides, emergency shelter openings, or vaccine alerts..."
                  rows={4}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  required
                  className="bg-white border border-[#E4E7EC] rounded-md px-3 py-1.5 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between border-t border-[#E4E7EC] pt-3">
                <span className="text-xs text-[#5A6072] font-medium">Pin to Home Page notice board</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noticePinned}
                    onChange={(e) => setNoticePinned(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D72638]"></div>
                </label>
              </div>

              {msg && (
                <p className={`text-[10px] font-semibold ${msg.type === 'success' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  {msg.text}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3 py-1.5 border border-[#E4E7EC] hover:bg-[#F7F8FA] rounded-md text-xs font-semibold text-[#5A6072]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-[#D72638] hover:bg-[#D72638]/95 text-white font-bold rounded-md text-xs"
                >
                  {loading ? 'Posting...' : 'Post Bulletin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
