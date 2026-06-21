'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Phone, Search, Plus, Edit, Trash2, X, MapPin } from 'lucide-react';
import { validateNepaliPhone, validateRequired } from '@/lib/validation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CATEGORIES = ['Police', 'Fire Brigade', 'Medical', 'Disaster Management', 'Utility', 'Women & Child Safety', 'Mental Health'];

const DISTRICTS = ['All', 'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Biratnagar', 'Birgunj', 'Dharan', 'Butwal', 'Nepalgunj'];

export default function AdminPulseLinePage() {
  const { data: contacts = [], error, isLoading, mutate } = useSWR('/api/contacts', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  // Search/Filters states
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editContact, setEditContact] = useState<any | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [category, setCategory] = useState('Police');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('');
  const [locationText, setLocationText] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    number?: string;
    district?: string;
    description?: string;
  }>({});

  const openAddModal = () => {
    setEditContact(null);
    setName('');
    setNumber('');
    setCategory('Police');
    setDescription('');
    setDistrict('');
    setLocationText('');
    setLatitude('');
    setLongitude('');
    setIsModalOpen(true);
  };

  const openEditModal = (contact: any) => {
    setEditContact(contact);
    setName(contact.name);
    setNumber(contact.number);
    setCategory(contact.category);
    setDescription(contact.description || '');
    setDistrict(contact.district || '');
    setLocationText(contact.location_text || '');
    setLatitude(contact.latitude?.toString() || '');
    setLongitude(contact.longitude?.toString() || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFormErrors({});

    // --- Validate ---
    const newErrors: typeof formErrors = {};
    if (!validateRequired(name)) {
      newErrors.name = 'Name is required';
    }
    if (!validateNepaliPhone(number)) {
      newErrors.number = 'Phone must be 98 or 97 followed by 8 digits';
    }
    if (!validateRequired(district)) {
      newErrors.district = 'District is required';
    }
    if (!validateRequired(description)) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setSubmitLoading(false);
      return;
    }

    const payload = { 
      name, 
      number, 
      category, 
      description,
      district: district || null,
      location_text: locationText || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    };
    const method = editContact ? 'PATCH' : 'POST';
    const endpoint = editContact ? `/api/contacts/${editContact.id}` : '/api/contacts';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        mutate();
        setIsModalOpen(false);
        setFormErrors({});
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to submit contact');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this emergency contact?')) return;

    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        mutate();
      } else {
        alert('Failed to delete contact');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter contacts
  const filteredContacts = contacts.filter((c: any) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.number.includes(search) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCat = catFilter === 'All' || c.category === catFilter;
    
    return matchesSearch && matchesCat;
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      <title>Manage Contacts — ResQ Nepal</title>

      <section className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-[#111318] flex items-center gap-2">
            <Phone className="h-5 w-5 text-[#D72638]" /> Manage PulseLine Contacts
          </h1>
          <p className="text-xs text-[#5A6072]">
            Create, update, or remove emergency helpline numbers from the directory.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1 px-3.5 py-2 bg-[#D72638] hover:bg-[#D72638]/95 text-white font-bold text-xs rounded-md shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Contact
        </button>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center select-none">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9AA0AD]">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search contacts by name, number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-[#E4E7EC] rounded-lg pl-10 pr-4 py-2 text-xs text-[#111318] focus:outline-none focus:border-[#1B4FD8]"
          />
        </div>

        <select
          value={catFilter}
          onChange={(e) => {
            setCatFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-48 bg-white border border-[#E4E7EC] rounded-lg px-3 py-2 text-xs text-[#111318] focus:outline-none"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Contacts Table */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-x-auto">
        {isLoading ? (
          <p className="text-center py-12 text-xs text-[#9AA0AD] italic">Loading directory list...</p>
        ) : paginatedContacts.length === 0 ? (
          <p className="text-center py-12 text-xs text-[#9AA0AD] italic">No contacts found matching filters.</p>
        ) : (
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E4E7EC] text-[#9AA0AD] font-mono">
                <th className="p-4">Name</th>
                <th className="p-4">Number</th>
                <th className="p-4">Category</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {paginatedContacts.map((c: any) => (
                <tr key={c.id} className="hover:bg-[#F7F8FA] transition-colors">
                  <td className="p-4 font-bold text-[#111318]">{c.name}</td>
                  <td className="p-4 font-mono font-semibold text-[#111318]">{c.number}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 bg-[#F7F8FA] border border-[#E4E7EC] rounded-full text-[10px] font-mono text-[#5A6072]">
                      {c.category}
                    </span>
                  </td>
                  <td className="p-4 text-[#5A6072] max-w-[240px]">
                    {c.district && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {c.district}
                        {c.location_text && ` - ${c.location_text}`}
                      </span>
                    )}
                    {!c.district && '—'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1 text-[#1B4FD8] hover:bg-blue-50 rounded"
                        title="Edit Contact"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1 text-[#DC2626] hover:bg-red-50 rounded"
                        title="Delete Contact"
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
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredContacts.length)} of {filteredContacts.length}
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
          <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-lg max-w-md w-full p-6 relative animate-in scale-in duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-[#E4E7EC] mb-4">
              <h3 className="font-bold text-sm text-[#111318]">
                {editContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
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
                <label className="text-[11px] font-bold text-[#111318]">Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kathmandu Police HQ"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formErrors.name) {
                      setFormErrors(prev => ({ ...prev, name: undefined }));
                    }
                  }}
                  className={`bg-white border rounded-md px-3 py-1.5 text-xs focus:outline-none ${formErrors.name ? 'border-red-500 focus:border-red-500' : 'border-[#E4E7EC]'}`}
                />
                {formErrors.name && <p className="text-[10px] text-red-600 font-semibold">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#111318]">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 98xxxxxxxx"
                    value={number}
                    onChange={(e) => {
                      setNumber(e.target.value);
                      if (formErrors.number) {
                        setFormErrors(prev => ({ ...prev, number: undefined }));
                      }
                    }}
                    className={`bg-white border rounded-md px-3 py-1.5 text-xs focus:outline-none ${formErrors.number ? 'border-red-500 focus:border-red-500' : 'border-[#E4E7EC]'}`}
                  />
                  {formErrors.number && <p className="text-[10px] text-red-600 font-semibold">{formErrors.number}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#111318]">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-white border border-[#E4E7EC] rounded-md px-3 py-1.5 text-xs focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#111318]">District</label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      if (formErrors.district) {
                        setFormErrors(prev => ({ ...prev, district: undefined }));
                      }
                    }}
                    className={`bg-white border rounded-md px-3 py-1.5 text-xs focus:outline-none ${formErrors.district ? 'border-red-500 focus:border-red-500' : 'border-[#E4E7EC]'}`}
                  >
                    <option value="">Select District</option>
                    {DISTRICTS.filter(d => d !== 'All').map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                  {formErrors.district && <p className="text-[10px] text-red-600 font-semibold">{formErrors.district}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#111318]">Location Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Patan, Lalitpur"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    className="bg-white border border-[#E4E7EC] rounded-md px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#111318]">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 27.7172"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="bg-white border border-[#E4E7EC] rounded-md px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#111318]">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 85.3240"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="bg-white border border-[#E4E7EC] rounded-md px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#111318]">Short Description</label>
                <textarea
                  placeholder="Details regarding availability or location..."
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (formErrors.description) {
                      setFormErrors(prev => ({ ...prev, description: undefined }));
                    }
                  }}
                  className={`bg-white border rounded-md px-3 py-1.5 text-xs focus:outline-none resize-none ${formErrors.description ? 'border-red-500 focus:border-red-500' : 'border-[#E4E7EC]'}`}
                />
                {formErrors.description && <p className="text-[10px] text-red-600 font-semibold">{formErrors.description}</p>}
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full h-10 bg-[#D72638] hover:bg-[#D72638]/95 text-white font-bold text-xs rounded-md shadow-sm transition-colors mt-2"
              >
                {submitLoading ? 'Saving...' : 'Save Contact'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
