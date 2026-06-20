'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Shield, KeyRound, User, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('resq_admin_session', data.token);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error authenticating admin account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-200">
      <title>Admin Login — ResQ Nepal</title>
      
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-md max-w-sm w-full flex flex-col gap-6">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center">
          <Logo className="scale-110 mb-2 select-none" />
          <p className="text-xs font-semibold text-[#9AA0AD] uppercase tracking-wider mt-1">
            System Administration
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111318] flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#5A6072]" /> Username
            </label>
            <input
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-white border border-[#E4E7EC] rounded-md px-3 py-2 text-xs text-[#111318] focus:outline-none focus:border-[#1B4FD8]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111318] flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-[#5A6072]" /> Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white border border-[#E4E7EC] rounded-md px-3 py-2 text-xs text-[#111318] focus:outline-none focus:border-[#1B4FD8]"
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 p-2.5 bg-red-50 border border-red-200 text-[#DC2626] rounded-md text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#D72638] hover:bg-[#D72638]/95 text-white font-bold text-xs rounded-md shadow-sm transition-colors mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Authorizing...
              </>
            ) : (
              'Enter Admin Space'
            )}
          </button>
        </form>
      </div>


    </div>
  );
}
