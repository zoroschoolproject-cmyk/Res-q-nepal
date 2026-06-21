'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { MessageSquare, Search, ClipboardList, X, Eye, MapPin, Copy, ExternalLink } from 'lucide-react';
import { formatNPT } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COMPLAINT_STATUSES = ['All', 'Submitted', 'Under Review', 'Resolved'];

export default function AdminVoiceBoxPage() {
  // SWR Data Fetching
  const { data: complaints = [], isLoading: complaintsLoading, mutate: mutateComplaints } = useSWR('/api/complaints', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  // Search/Filters states
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintStatus, setComplaintStatus] = useState('All');

  // Pagination states
  const [complaintPage, setComplaintPage] = useState(1);
  const itemsPerPage = 10;

  // Edit states - Complaint Response
  const [editingComplaint, setEditingComplaint] = useState<any | null>(null);
  const [responseStatus, setResponseStatus] = useState('Submitted');
  const [adminResponse, setAdminResponse] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // View details modal state
  const [viewingComplaint, setViewingComplaint] = useState<any | null>(null);

  // Open Response Modal
  const openResponseModal = (comp: any) => {
    setEditingComplaint(comp);
    setResponseStatus(comp.status);
    setAdminResponse(comp.admin_response || '');
  };

  // Submit Municipal Response
  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const res = await fetch(`/api/complaints/${editingComplaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: responseStatus,
          admin_response: adminResponse,
        }),
      });

      if (res.ok) {
        mutateComplaints();
        setEditingComplaint(null);
      } else {
        alert('Failed to save complaint response');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- Filter Complaints ---
  const filteredComplaints = complaints.filter((c: any) => {
    const matchesSearch =
      c.complaint_id.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.subject.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(complaintSearch.toLowerCase());
    
    const matchesStatus = complaintStatus === 'All' || c.status === complaintStatus;

    return matchesSearch && matchesStatus;
  });

  const complaintTotalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
    (complaintPage - 1) * itemsPerPage,
    complaintPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-[#FEF3C7] text-[#D97706] border-yellow-200';
      case 'Under Review':
        return 'bg-[#DBEAFE] text-[#1B4FD8] border-blue-200';
      case 'Resolved':
        return 'bg-[#DCFCE7] text-[#16A34A] border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      <title>Manage VoiceBox — ResQ Nepal</title>

      <section className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-[#111318] flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#D72638]" /> Manage VoiceBox
        </h1>
        <p className="text-xs text-[#5A6072]">
          Respond to registered municipal complaints.
        </p>
      </section>

      <div className="flex flex-col md:flex-row gap-3 items-center select-none">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9AA0AD]">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search complaints by ID, subject..."
            value={complaintSearch}
            onChange={(e) => {
              setComplaintSearch(e.target.value);
              setComplaintPage(1);
            }}
            className="w-full bg-white border border-[#E4E7EC] rounded-lg pl-10 pr-4 py-2 text-xs text-[#111318] focus:outline-none focus:border-[#1B4FD8]"
          />
        </div>

        <select
          value={complaintStatus}
          onChange={(e) => {
            setComplaintStatus(e.target.value);
            setComplaintPage(1);
          }}
          className="w-full md:w-48 bg-white border border-[#E4E7EC] rounded-lg px-3 py-2 text-xs text-[#111318] focus:outline-none"
        >
          {COMPLAINT_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st} status
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-x-auto">
        {complaintsLoading ? (
          <p className="text-center py-12 text-xs text-[#9AA0AD] italic">Loading complaints registry...</p>
        ) : paginatedComplaints.length === 0 ? (
          <p className="text-center py-12 text-xs text-[#9AA0AD] italic font-medium">No complaints match search filters.</p>
        ) : (
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E4E7EC] text-[#9AA0AD] font-mono">
                <th className="p-4">Grievance ID</th>
                <th className="p-4">Category</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Lodged</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {paginatedComplaints.map((c: any) => (
                <tr key={c.id} className="hover:bg-[#F7F8FA] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#111318]">{c.complaint_id}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-[#F7F8FA] border border-[#E4E7EC] rounded-full text-[10px] font-mono text-[#5A6072]">
                      {c.category}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-[#111318] max-w-[200px] truncate">{c.subject}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-mono ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[#9AA0AD]">{formatNPT(c.created_at)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setViewingComplaint(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-md shadow-sm transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        View Details
                      </button>
                      <button
                        onClick={() => openResponseModal(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B4FD8] hover:bg-[#1B4FD8]/95 text-white font-bold text-xs rounded-md shadow-sm transition-colors"
                      >
                        Respond
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
      {complaintTotalPages > 1 && (
        <div className="flex justify-between items-center select-none">
          <span className="text-[10px] font-mono text-[#9AA0AD]">
            Showing {(complaintPage - 1) * itemsPerPage + 1} to {Math.min(complaintPage * itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setComplaintPage(Math.max(1, complaintPage - 1))}
              disabled={complaintPage === 1}
              className="px-3 py-1 bg-white border border-[#E4E7EC] text-xs font-semibold rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-xs font-mono font-bold flex items-center text-[#111318]">
              {complaintPage} / {complaintTotalPages}
            </span>
            <button
              onClick={() => setComplaintPage(Math.min(complaintTotalPages, complaintPage + 1))}
              disabled={complaintPage === complaintTotalPages}
              className="px-3 py-1 bg-white border border-[#E4E7EC] text-xs font-semibold rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit Response Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-lg max-w-md w-full p-6 relative animate-in scale-in duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-[#E4E7EC] mb-4">
              <h3 className="font-bold text-sm text-[#111318] flex items-center gap-1.5">
                <ClipboardList className="h-5 w-5 text-[#D72638]" /> Municipal Action: {editingComplaint.complaint_id}
              </h3>
              <button
                onClick={() => setEditingComplaint(null)}
                className="p-1 rounded-full text-[#5A6072] hover:bg-[#F7F8FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResponseSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 bg-[#F7F8FA] border border-[#E4E7EC] rounded-lg p-3 text-xs leading-relaxed text-[#5A6072]">
                <span className="font-bold text-[#111318] block mb-0.5">Subject: {editingComplaint.subject}</span>
                {editingComplaint.description}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#111318]">Action Status</label>
                <select
                  value={responseStatus}
                  onChange={(e) => setResponseStatus(e.target.value)}
                  className="bg-white border border-[#E4E7EC] rounded-md px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Submitted">Submitted (Reviewing)</option>
                  <option value="Under Review">Under Review (Forwarded to Ward)</option>
                  <option value="Resolved">Resolved (Issues corrected)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#111318]">Municipal Response Message</label>
                <textarea
                  placeholder="Inform the citizen regarding the inspection team assigned, repair scheduling, etc..."
                  rows={4}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  required
                  className="bg-white border border-[#E4E7EC] rounded-md px-3 py-2 text-xs focus:outline-none resize-none font-sans leading-relaxed text-[#111318]"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full h-10 bg-[#D72638] hover:bg-[#D72638]/95 text-white font-bold text-xs rounded-md shadow-sm transition-colors mt-2"
              >
                {submitLoading ? 'Saving response...' : 'Post Municipal Action'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingComplaint && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-lg max-w-lg w-full p-6 relative animate-in scale-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#E4E7EC] mb-4">
              <h3 className="font-bold text-sm text-[#111318] flex items-center gap-1.5">
                Complaint Details
              </h3>
              <button
                onClick={() => setViewingComplaint(null)}
                className="p-1 rounded-full text-[#5A6072] hover:bg-[#F7F8FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Complaint ID */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-[#9AA0AD] uppercase">Complaint ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#111318]">{viewingComplaint.complaint_id}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(viewingComplaint.complaint_id);
                    }}
                    className="p-1 text-[#5A6072] hover:bg-gray-100 rounded"
                    title="Copy ID"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-[#9AA0AD] uppercase">Subject</span>
                <span className="font-bold text-[#111318]">{viewingComplaint.subject}</span>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-[#9AA0AD] uppercase">Category</span>
                <span className="text-[#111318]">{viewingComplaint.category}</span>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-[#9AA0AD] uppercase">Description</span>
                <p className="text-xs text-[#5A6072] leading-relaxed">{viewingComplaint.description}</p>
              </div>

              {/* Complainant Info */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-[#9AA0AD] uppercase">Complainant</span>
                {viewingComplaint.is_anonymous ? (
                  <span className="text-xs text-[#5A6072]">Anonymous</span>
                ) : (
                  <div className="text-xs text-[#111318]">
                    <p>Name: {viewingComplaint.complainant_name}</p>
                    <p>Phone: {viewingComplaint.complainant_phone}</p>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-[#9AA0AD] uppercase">Location</span>
                <div className="text-xs text-[#111318]">
                  {viewingComplaint.location_text && <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{viewingComplaint.location_text}</p>}
                  {viewingComplaint.district && <p>District: {viewingComplaint.district}</p>}
                  {viewingComplaint.latitude && viewingComplaint.longitude && (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${viewingComplaint.latitude}&mlon=${viewingComplaint.longitude}#map=15/${viewingComplaint.latitude}/${viewingComplaint.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#1B4FD8] hover:underline mt-1"
                    >
                      <ExternalLink className="h-3 w-3" /> View on Map
                    </a>
                  )}
                </div>
              </div>

              {/* Image */}
              {viewingComplaint.image_path && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-[#9AA0AD] uppercase">Image</span>
                  <img
                    src={viewingComplaint.image_path}
                    alt="Complaint"
                    className="w-full h-48 object-cover rounded-md border border-[#E4E7EC]"
                  />
                </div>
              )}

              {/* Status */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-[#9AA0AD] uppercase">Status</span>
                <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-mono w-fit ${getComplaintStatusBadge(viewingComplaint.status)}`}>
                  {viewingComplaint.status}
                </span>
              </div>

              {/* Admin Response */}
              {viewingComplaint.admin_response && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-[#9AA0AD] uppercase">Admin Response</span>
                  <p className="text-xs text-[#111318] leading-relaxed bg-[#F7F8FA] border border-[#E4E7EC] rounded-md p-3">
                    {viewingComplaint.admin_response}
                  </p>
                </div>
              )}

              {/* Created Date */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-[#9AA0AD] uppercase">Created At</span>
                <span className="text-xs text-[#5A6072] font-mono">{formatNPT(viewingComplaint.created_at, 'full')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get status badge
function getComplaintStatusBadge(status: string) {
  switch (status) {
    case 'Submitted':
      return 'bg-[#FEF3C7] text-[#D97706] border-yellow-200';
    case 'Under Review':
      return 'bg-[#DBEAFE] text-[#1B4FD8] border-blue-200';
    case 'Resolved':
      return 'bg-[#DCFCE7] text-[#16A34A] border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
