'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { ClipboardList, Search, Plus, Edit, Trash2, X, Pin, PinOff } from 'lucide-react';
import { formatNPT } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminNoticesPage() {
  // SWR Fetching
  const { data: notices = [], isLoading, mutate } = useSWR('/api/notices', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editNotice, setEditNotice] = useState<any | null>(null);

  // Form states
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeIsPinned, setNoticeIsPinned] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const openAddModal = () => {
    setEditNotice(null);
    setNoticeTitle('');
    setNoticeContent('');
    setNoticeIsPinned(false);
    setIsModalOpen(true);
  };

  const openEditModal = (notice: any) => {
    setEditNotice(notice);
    setNoticeTitle(notice.title);
    setNoticeContent(notice.content);
    setNoticeIsPinned(notice.is_pinned === 1);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    const payload = {
      title: noticeTitle,
      content: noticeContent,
      is_pinned: noticeIsPinned ? 1 : 0,
    };

    const method = editNotice ? 'PATCH' : 'POST';
    const endpoint = editNotice ? `/api/notices/${editNotice.id}` : '/api/notices';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        mutate();
        setIsModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save notice bulletin');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notice bulletin?')) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        mutate();
      } else {
        alert('Failed to delete notice bulletin');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (notice: any) => {
    try {
      const res = await fetch(`/api/notices/${notice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: notice.is_pinned === 1 ? 0 : 1 }),
      });
      if (res.ok) {
        mutate();
      } else {
        alert('Failed to update notice pinned state');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter
  const filteredNotices = notices.filter((n: any) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / itemsPerPage));
  const paginatedNotices = filteredNotices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      <title>Manage Notices — ResQ Nepal</title>

      <section className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-[#111318] flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#D72638]" /> Manage Notices Board
          </h1>
          <p className="text-xs text-[#5A6072]">
            Publish landslide/monsoon alerts, coordinate hospital blood drives, or announce emergency response updates.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1 px-3.5 py-2 bg-[#D72638] hover:bg-[#D72638]/95 text-white font-bold text-xs rounded-md shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Notice
        </button>
      </section>

      {/* Search Filter */}
      <div className="relative w-full select-none">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9AA0AD]">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Search notice bulletins by title, content..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-white border border-[#E4E7EC] rounded-lg pl-10 pr-4 py-2 text-xs text-[#111318] focus:outline-none focus:border-[#1B4FD8]"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-x-auto">
        {isLoading ? (
          <p className="text-center py-12 text-xs text-[#9AA0AD] italic">Loading bulletins...</p>
        ) : paginatedNotices.length === 0 ? (
          <p className="text-center py-12 text-xs text-[#9AA0AD] italic">No bulletins found matching filters.</p>
        ) : (
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E4E7EC] text-[#9AA0AD] font-mono">
                <th className="p-4">Bulletin</th>
                <th className="p-4">Pin Status</th>
                <th className="p-4">Published Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {paginatedNotices.map((n: any) => (
                <tr key={n.id} className="hover:bg-[#F7F8FA] transition-colors">
                  <td className="p-4 max-w-lg">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#111318] flex items-center gap-1.5">
                        {n.is_pinned === 1 && <span title="Pinned Notice">📌</span>}
                        {n.title}
                      </span>
                      <p className="text-xs text-[#5A6072] leading-relaxed line-clamp-2" title={n.content}>
                        {n.content}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                      n.is_pinned === 1 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-100 border-gray-200 text-gray-400'
                    }`}>
                      {n.is_pinned === 1 ? 'Pinned' : 'Regular'}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[#5A6072]">{formatNPT(n.created_at)}</td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleTogglePin(n)}
                        className={`p-1 rounded ${n.is_pinned === 1 ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        title={n.is_pinned === 1 ? 'Unpin Notice' : 'Pin Notice'}
                      >
                        {n.is_pinned === 1 ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => openEditModal(n)}
                        className="p-1 text-[#1B4FD8] hover:bg-blue-50 rounded"
                        title="Edit Notice"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1 text-[#D72638] hover:bg-red-50 rounded"
                        title="Delete Notice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center select-none">
          <span className="text-[10px] font-mono text-[#9AA0AD]">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredNotices.length)} of {filteredNotices.length}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white hover:bg-[#F7F8FA] border border-[#E4E7EC] text-xs font-semibold rounded-md shadow-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-xs font-mono font-bold flex items-center text-[#111318]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white hover:bg-[#F7F8FA] border border-[#E4E7EC] text-xs font-semibold rounded-md shadow-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Form Modal (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-lg max-w-sm w-full p-6 relative animate-in scale-in duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-[#E4E7EC] mb-4">
              <h3 className="font-bold text-sm text-[#111318]">
                {editNotice ? 'Edit Notice Bulletin' : 'Add Notice Bulletin'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-[#5A6072] hover:bg-[#F7F8FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#111318]">Bulletin Title</label>
                <input
                  type="text"
                  placeholder="e.g. Monsoon Precaution Advisory"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  required
                  className="bg-white border border-[#E4E7EC] rounded-md px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#111318]">Content Message</label>
                <textarea
                  placeholder="Details regarding the emergency announcement..."
                  rows={4}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  required
                  className="bg-white border border-[#E4E7EC] rounded-md px-3 py-1.5 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between border-t border-[#E4E7EC] pt-3">
                <span className="text-xs text-[#5A6072] font-semibold">Pin bulletin to top</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noticeIsPinned}
                    onChange={(e) => setNoticeIsPinned(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D72638]"></div>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full h-10 bg-[#D72638] hover:bg-[#D72638]/95 text-white font-bold text-xs rounded-md shadow-sm transition-colors mt-2"
              >
                {submitLoading ? 'Saving...' : 'Save Notice'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
