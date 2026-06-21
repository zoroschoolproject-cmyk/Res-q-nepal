'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { KeyRound } from 'lucide-react';

export default function FloatingAdminButton() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) return null;

  return (
    <Link
      href="/admin"
      className="fixed bottom-6 right-6 z-50 hidden md:flex items-center gap-2 px-4 py-3 bg-[#111318] hover:bg-[#D72638] text-white rounded-full shadow-lg transition-all duration-200 cursor-pointer"
      title="Admin Control Panel"
    >
      <KeyRound className="h-4 w-4" />
      <span className="text-xs font-bold">Admin</span>
    </Link>
  );
}
