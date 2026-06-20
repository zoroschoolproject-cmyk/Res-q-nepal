'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { LayoutDashboard, PhoneCall, ShieldAlert, MessageSquare, Heart, LogOut, Menu, X, ClipboardList } from 'lucide-react';

const SIDEBAR_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pulseline', label: 'PulseLine Contacts', icon: PhoneCall },
  { href: '/admin/voicebox', label: 'VoiceBox complaints', icon: MessageSquare },
  { href: '/admin/aiddrop', label: 'AidDrop Donors', icon: Heart },
  { href: '/admin/notices', label: 'Notice Board bulletins', icon: ClipboardList },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('resq_admin_session');
      const isLoginRoute = pathname === '/admin';

      if (!token && !isLoginRoute) {
        setIsAuthenticated(false);
        router.push('/admin');
      } else if (token && isLoginRoute) {
        setIsAuthenticated(true);
        router.push('/admin/dashboard');
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      localStorage.removeItem('resq_admin_session');
      setIsAuthenticated(false);
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  };

  // While checking auth, show a loading spinner
  if (isAuthenticated === null && pathname !== '/admin') {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D72638] border-t-transparent" />
      </div>
    );
  }

  // If we are on the login page, render children directly without dashboard borders
  if (pathname === '/admin') {
    return <div className="flex-1 flex flex-col">{children}</div>;
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-[#F7F8FA] -mx-4 -my-6 md:-my-8 select-none">
      
      {/* Top Bar for Mobile */}
      <div className="md:hidden sticky top-0 w-full h-14 bg-white border-b border-[#E4E7EC] flex items-center justify-between px-4 z-40">
        <Logo showText={true} />
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1 rounded-md text-[#5A6072]"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-14 md:top-0 h-[calc(100vh-56px)] md:h-screen w-60 bg-white border-r border-[#E4E7EC] z-30 transition-transform duration-200 shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full justify-between py-4">
          <div className="flex flex-col gap-6">
            {/* Logo area on desktop */}
            <div className="hidden md:block px-6 pb-2 border-b border-[#E4E7EC]">
              <Logo className="scale-105" />
              <span className="text-[10px] font-mono text-[#9AA0AD] block mt-1 tracking-wider uppercase font-semibold">
                Control room
              </span>
            </div>

            {/* Sidebar Navigation links */}
            <nav className="flex flex-col gap-1 px-3">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#D72638]/5 border-l-2 border-[#D72638] text-[#D72638]'
                        : 'text-[#5A6072] hover:bg-[#F7F8FA] hover:text-[#111318]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Logout footer */}
          <div className="px-3 border-t border-[#E4E7EC] pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 w-full text-xs font-semibold text-[#DC2626] hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile menu */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 top-14 bg-black/30 z-20"
        />
      )}

      {/* Main Admin Content Container */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1080px] mx-auto w-full">
        {children}
      </div>

    </div>
  );
}
