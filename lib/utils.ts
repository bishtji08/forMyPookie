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
 * In the browser, ALWAYS uses window.location.origin so shared links and QR codes use the real, active deployment domain.
 */
export function getAppUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, '')}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`;
  }

  return 'http://localhost:3000';
}

/**
 * Checks if a given media URL or filename corresponds to a video format.
 */
export function isVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|mov|ogg|m4v|quicktime)(\?.*)?$/i.test(url);
}

/**
 * Checks if a string is a standard RFC 4122 UUID.
 */
export function isValidUUID(str?: string | null): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
}

/**
 * Resolves the canonical, permanent shareable URL for a relationship experience.
 * Always resolves to the stable production domain (or configured NEXT_PUBLIC_APP_URL),
 * preventing broken links caused by temporary preview deployments, VERCEL_URL, or branch URLs.
 * In local browser development (localhost/127.0.0.1), uses local origin for testing.
 */
export function getRelationshipShareUrl(id: string): string {
  const cleanId = (id || '').trim();
  const prodBase =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') ||
    'https://my-pookie-three.vercel.app';

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${window.location.origin}/love/${cleanId}`;
    }
  } else if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_APP_URL) {
    return `http://localhost:3000/love/${cleanId}`;
  }

  return `${prodBase}/love/${cleanId}`;
}
