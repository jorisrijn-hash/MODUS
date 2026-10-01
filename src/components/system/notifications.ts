const NOTIFY_EVENT = "modus:system:notify";

export type SystemNotification = {
  id: string;
  message: string;
  label?: string;
};

let idCounter = 0;

export function notify(message: string, label?: string) {
  idCounter += 1;
  const detail: SystemNotification = { id: `notice-${idCounter}`, message, label };
  window.dispatchEvent(new CustomEvent(NOTIFY_EVENT, { detail }));
}

export function listenNotify(cb: (notification: SystemNotification) => void) {
  const handler = (e: Event) => cb((e as CustomEvent).detail as SystemNotification);
  window.addEventListener(NOTIFY_EVENT, handler);
  return () => window.removeEventListener(NOTIFY_EVENT, handler);
}
