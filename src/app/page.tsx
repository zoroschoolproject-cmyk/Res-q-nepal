import Link from 'next/link';
import db from '@/lib/db';
import Logo from '@/components/Logo';
import { formatNPT } from '@/lib/utils';
import { Activity, ShieldCheck, MessageSquare, Heart } from 'lucide-react';

const FEATURES = [
  {
    href: '/pulseline',
    label: 'PulseLine',
    description: 'Quick dial numbers for police, fire, medical, utility, and safety response teams.',
    icon: Activity,
  },
  {
    href: '/voicebox',
    label: 'Complaint Portal',
    description: 'Submit formal complaints to civic authorities.',
    icon: MessageSquare,
  },
  {
    href: '/aiddrop',
    label: 'Blood Donation Network',
    description: 'Enlist as a blood donor or find nearby blood banks.',
    icon: Heart,
  },
  {
    href: '/safelink',
    label: 'SafeLink',
    description: 'Trusted safety guides, emergency preparedness, and verified resources.',
    icon: ShieldCheck,
  },
];

export default async function HomePage() {
  const client = db.getClient();
  
  // Query pinned notices from notices table
  const noticesResult = await client.execute('SELECT * FROM notices WHERE is_pinned = 1 ORDER BY created_at DESC LIMIT 100');
  const notices = noticesResult.rows as any[];

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in duration-200">
      <title>Home — ResQ Nepal</title>
      
      {/* Hero Header */}
      <section className="flex flex-col items-center text-center mt-6">
        <Logo className="flex-col !gap-3 text-center scale-110 mb-2 pointer-events-none" showText={true} />
        <p className="text-lg font-medium text-[#5A6072] italic max-w-md mt-1">
          "Your community emergency platform for Nepal"
        </p>
      </section>

      {/* Signature Element: SOS Pulse Ring */}
      <section className="flex flex-col items-center justify-center py-4">
        <div className="relative flex items-center justify-center">
          {/* Pulsing Backdrops */}
          <div className="absolute w-28 h-28 rounded-full bg-[#D72638] opacity-35 sos-pulse-ring-1" />
          <div className="absolute w-28 h-28 rounded-full bg-[#D72638] opacity-25 sos-pulse-ring-2" />
          
          {/* Main Trigger Button */}
          <Link
            href="/pulseline?mode=sos"
            className="relative z-10 w-24 h-24 rounded-full bg-[#D72638] text-white font-bold text-lg flex flex-col items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all duration-200 hover:bg-[#D72638]/95 select-none"
          >
            <span className="text-[11px] font-mono opacity-80 uppercase tracking-wider">Trigger</span>
            <span className="text-xl tracking-wider font-extrabold -mt-1">SOS</span>
          </Link>
        </div>
      </section>

      {/* Grid of Features */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-mono font-bold text-[#9AA0AD] uppercase tracking-wider">
          Platform Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <Link
                key={feat.href}
                href={feat.href}
                className="group flex flex-col gap-2 p-5 bg-white border border-[#E4E7EC] rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-[#D72638]/10 text-[#D72638] group-hover:bg-[#D72638] group-hover:text-white transition-colors duration-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-bold text-sm text-[#111318] group-hover:text-[#D72638] transition-colors">
                    {feat.label}
                  </span>
                </div>
                <p className="text-xs text-[#5A6072] leading-relaxed mt-1">
                  {feat.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Notices Board (Full Width) */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-mono font-bold text-[#9AA0AD] uppercase tracking-wider flex items-center gap-2">
          <span>📢</span> Notice Board
        </h2>
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col gap-4">
          {notices.length === 0 ? (
            <p className="text-xs text-[#9AA0AD] italic text-center py-6">
              "No active notices at this time"
            </p>
          ) : (
            <div className="divide-y divide-[#E4E7EC] flex flex-col">
              {notices.map((n) => (
                <div key={n.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-bold text-sm text-[#111318]">{n.title}</h3>
                    <span className="text-[10px] font-mono text-[#9AA0AD]">
                      {formatNPT(n.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6072] mt-1.5 leading-relaxed">
                    {n.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
