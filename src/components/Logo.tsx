'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = '', showText = true }: LogoProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <Link href="/" className={`flex items-center gap-2 select-none hover:opacity-90 transition-opacity ${className}`}>
      {!hasError ? (
        <img
          src="/images/logo.png"
          alt="ResQ Nepal"
          className="h-15 w-15 object-cover rounded-md"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-2xl" role="img" aria-label="emergency">🆘</span>
      )}
      {showText && (
        <span className="font-bold text-lg tracking-tight text-[#111318]">
          ResQ Nepal
        </span>
      )}
    </Link>
  );
}
