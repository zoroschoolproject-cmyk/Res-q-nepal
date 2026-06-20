'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { formatNPT } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll notifications every 5 seconds
  const { data: notifications = [], mutate } = useSWR('/api/notifications', fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'PATCH' });
      if (res.ok) {
        mutate();
      }
    } catch (err) {
      // Empty catch
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      if (res.ok) {
        mutate();
      }
    } catch (err) {
      // Empty catch
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-[#5A6072] hover:bg-[#F7F8FA] hover:text-[#111318] focus:outline-none transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#D72638] text-[10px] font-mono font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl border border-[#E4E7EC] shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 bg-[#F7F8FA] border-b border-[#E4E7EC]">
            <h3 className="font-bold text-sm text-[#111318]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-[#1B4FD8] hover:text-[#111318] font-medium transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-height-[320px] overflow-y-auto divide-y divide-[#E4E7EC]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#9AA0AD]">
                No notifications yet
              </div>
            ) : (
              notifications.map((n: any) => (
                <div
                  key={n.id}
                  className={`p-4 hover:bg-[#F7F8FA] transition-colors ${
                    !n.is_read ? 'bg-[#DBEAFE]/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-mono bg-[#E4E7EC] text-[#5A6072] px-2 py-0.5 rounded-full">
                      {n.type}
                    </span>
                    <span className="text-[11px] font-mono text-[#9AA0AD]">
                      {formatNPT(n.created_at)}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#111318] mt-1.5">{n.title}</h4>
                  <p className="text-xs text-[#5A6072] mt-1 line-clamp-2">{n.message}</p>
                  
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="mt-2 flex items-center gap-1 text-[11px] text-[#1B4FD8] hover:text-[#111318] font-medium transition-colors"
                    >
                      <Check className="h-3 w-3" />
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
