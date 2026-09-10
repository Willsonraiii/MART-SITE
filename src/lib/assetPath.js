// Prefixes a root-relative path (e.g. "/images/foo.jpg") with Vite's BASE_URL
// so it resolves correctly both locally (base "/") and on GitHub Pages
// (base "/MART-SITE/"). Leaves absolute URLs (http://, https://) untouched.
export function assetPath(path) {
  if (!path) return path
  if (/^https?:\/\//i.test(path)) return path
  const base = import.meta.env.BASE_URL // e.g. "/MART-SITE/" or "/"
  return base.replace(/\/$/, '') + path
}
