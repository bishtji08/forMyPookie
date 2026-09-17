import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates and sanitizes internal redirect URLs to prevent open redirect (CWE-601) attacks.
 */
export function getSafeRedirect(url: string | null | undefined, fallback: string = '/'): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  // Reject protocol-relative URLs (e.g., //evil.com, /\\evil.com) or external schemes
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.startsWith('/#')) {
    return fallback;
  }
  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') {
      return fallback;
    }
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}

/**
 * Resolves the primary application URL dynamically from the browser window or environment variables.
 * Guarantees no trailing slashes and avoids hardcoded localhost dependencies in production.
 */
export function getAppUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`;
  }
  return 'https://my-pookie-1qyt.vercel.app';
}
