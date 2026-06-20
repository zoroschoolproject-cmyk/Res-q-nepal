import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import FloatingAdminButton from '@/components/FloatingAdminButton';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const interMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-inter-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ResQ Nepal — Community Emergency & Civic Platform',
  description: 'Your community emergency platform for Nepal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${interMono.variable} h-full`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {/* Desktop Top Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-[1080px] mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8 flex flex-col">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Mobile Bottom Navigation */}
        <BottomNav />

        {/* Floating Admin Button */}
        <FloatingAdminButton />
      </body>
    </html>
  );
}
