export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type Listener = (opts: ConfirmOptions | null) => void;

let current: { options: ConfirmOptions; resolve: (v: boolean) => void } | null =
  null;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn(current?.options ?? null));
}

export function confirm(opts: ConfirmOptions): Promise<boolean> {
  if (current) {
    current.resolve(false);
  }
  return new Promise<boolean>((resolve) => {
    current = { options: opts, resolve };
    notify();
  });
}

export function resolveConfirm(value: boolean): void {
  if (current) {
    current.resolve(value);
    current = null;
    notify();
  }
}

export function subscribeConfirm(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
