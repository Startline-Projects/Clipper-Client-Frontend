import { mapApiError } from '@/lib/api/error-map';

export interface Toast {
  id: string;
  variant: 'error' | 'success' | 'info' | 'loading';
  title?: string;
  message: string;
  action?: { label: string; onPress: () => void };
}

type Listener = (toasts: Toast[]) => void;

const MAX_VISIBLE = 3;
const DURATIONS: Record<Toast['variant'], number | null> = {
  error: 4500,
  success: 2800,
  info: 3500,
  loading: null,
};

let toasts: Toast[] = [];
const listeners = new Set<Listener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function notify() {
  listeners.forEach((fn) => fn([...toasts]));
}

export function showToast(opts: Omit<Toast, 'id'>): string {
  const id = genId();
  const toast: Toast = { ...opts, id };
  toasts = [toast, ...toasts].slice(0, MAX_VISIBLE);
  const dur = DURATIONS[toast.variant];
  if (dur) {
    timers.set(id, setTimeout(() => dismiss(id), dur));
  }
  notify();
  return id;
}

export function showErrorToast(err: unknown, fallback?: string): string {
  const mapped = mapApiError(err);
  return showToast({
    variant: 'error',
    title: mapped.title,
    message: mapped.message || fallback || 'Something went wrong',
  });
}

export function showSuccessToast(message: string, title?: string): string {
  return showToast({ variant: 'success', title, message });
}

export function dismiss(id: string): void {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function dismissAll(): void {
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
  toasts = [];
  notify();
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
}
