const base = (process.env.NEXT_PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090').replace(/\/$/, '');

export function resolveAssetUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path; // external URL — pass through unchanged
  return `${base}${path}`;               // relative PocketBase path → full URL
}
