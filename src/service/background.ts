// An empty value or the raw __BACKGROUND__ placeholder (variables.sh never ran) means
// no background is configured.
export function resolveBackground(raw: string): string | null {
  return raw === '' || raw === '__BACKGROUND__' ? null : raw;
}

// Wraps the browser Image API (like navigation.ts wraps window.location) so a
// configured-but-broken URL (404, wrong domain, ...) can be detected and tested —
// resolves true on load, false on error.
export function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(true);
    };
    img.onerror = () => {
      resolve(false);
    };
    img.src = url;
  });
}
