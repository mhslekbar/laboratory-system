// src/utils/url.ts
// Build an absolute URL for assets served by your backend.
// If input is already absolute (http/https), it’s returned as-is.
export const resolveAssetUrl = (u?: string, host?: string) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (!host) return u;
  const base = host.replace(/\/+$/, "");
  const path = u.startsWith("/") ? u : `/${u}`;
  console.log(`${base}${path}: `, `${base}${path}`)
  return `${base}${path}`;
};

// Keep DB clean with relative paths if your API returns absolute URLs.
export const toRelativeIfHosted = (url: string, host?: string) => {
  if (!host) return url;
  const base = host.replace(/\/+$/, "");
  return url.startsWith(base) ? url.slice(base.length) || "/" : url;
};
