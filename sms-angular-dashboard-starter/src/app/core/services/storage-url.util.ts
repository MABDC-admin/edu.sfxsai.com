import { environment } from '../../../environments/environment';

const ABSOLUTE_OR_INLINE_URL = /^(data:|blob:|https?:\/\/)/i;

export function normalizeStorageUrl(value?: string | null): string {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('/api/')) return raw;
  if (ABSOLUTE_OR_INLINE_URL.test(raw)) return raw;
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  const apiUrl = environment.apiUrl.replace(/\/+$/, '');
  if (path.startsWith('/storage/')) {
    return apiUrl.startsWith('http') ? `${apiUrl}${path}` : path;
  }
  return apiUrl.startsWith('http') ? `${apiUrl}${path}` : path;
}
