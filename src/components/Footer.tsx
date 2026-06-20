'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) return null;

  return (
    <footer className="w-full py-4 border-t border-[#E4E7EC] mt-auto bg-white select-none">
      <div className="max-w-[1080px] mx-auto px-4 flex items-center justify-center text-xs text-[#9AA0AD]">
        <span>&copy; {new Date().getFullYear()} ResQ Nepal. All rights reserved.</span>
      </div>
    </footer>
  );
}
