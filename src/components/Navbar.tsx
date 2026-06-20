'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/pulseline', label: 'PulseLine' },
  { href: '/voicebox', label: 'Complaints' },
  { href: '/aiddrop', label: 'Blood Donation' },
];

export default function Navbar() {
  const pathname = usePathname();

  // Don't show header inside admin dashboard to prevent layouts cluttering
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) return null;

  return (
    <header className="sticky top-0 w-full h-14 bg-white border-b border-[#E4E7EC] z-40 select-none">
      <div className="max-w-[1080px] h-full mx-auto px-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="w-auto md:w-[180px] shrink-0 flex items-center">
          <Logo />
        </div>

        {/* Center: Desktop navigation links */}
        <nav className="hidden md:flex items-center gap-6 h-full">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center h-full text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'text-[#111318]'
                    : 'text-[#5A6072] hover:text-[#111318]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D72638]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Notification bell */}
        <div className="w-auto md:w-[240px] shrink-0 flex items-center justify-end gap-4">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}