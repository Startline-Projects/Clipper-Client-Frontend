const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

// Accepts a pre-projected local date (YYYY-MM-DD) and formats it without any
// timezone conversion. Constructing `new Date("2026-05-11")` parses as UTC
// midnight, which can render as the previous day in negative-offset zones.
export function formatDate(localDate: string): string {
  const [y, m, d] = localDate.slice(0, 10).split('-').map(Number);
  return dateFormatter.format(new Date(y, (m ?? 1) - 1, d ?? 1));
}

// For UTC ISO strings that must be projected into a specific IANA timezone.
export function formatDateInZone(isoUtc: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone,
  }).format(new Date(isoUtc));
}

export function formatTimeInZone(isoUtc: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(new Date(isoUtc));
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

const KM_TO_MI = 0.621371;

export function formatDistance(km: number): string {
  const miles = km * KM_TO_MI;
  return `${miles.toFixed(1)} mi`;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();

  if (diff < MINUTE) return 'just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`;
  if (diff < MONTH) return `${Math.floor(diff / WEEK)}w ago`;
  return `${Math.floor(diff / MONTH)}mo ago`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
