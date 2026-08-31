const cache = new Map<string, Promise<void>>();

/** Inject a <script src> once; resolves when it has loaded. */
export function loadScript(src: string): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  const existing = cache.get(src);
  if (existing) return existing;

  const p = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(el);
  });
  cache.set(src, p);
  return p;
}
