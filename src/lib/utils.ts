import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert UTC dates to Nepal Standard Time (NPT) - Asia/Kathmandu
export function formatNPT(dateInput: string | Date | number, formatStyle: 'full' | 'short' | 'time' = 'short'): string {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid Date';

    if (formatStyle === 'time') {
      return date.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kathmandu',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    if (formatStyle === 'full') {
      return date.toLocaleDateString('en-US', {
        timeZone: 'Asia/Kathmandu',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    // Default short format
    return date.toLocaleDateString('en-US', {
      timeZone: 'Asia/Kathmandu',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (err) {
    return String(dateInput);
  }
}
