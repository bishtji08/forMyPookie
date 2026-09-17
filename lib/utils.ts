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

export const CANONICAL_APP_URL = 'https://my-pookie-three.vercel.app';

/**
 * Resolves the primary application URL dynamically.
 * Automatically prevents preview deployment URLs from leaking into public QR codes or OAuth callbacks.
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin;
    // If running on local development (localhost or 127.0.0.1), keep local origin
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin;
    }
    // If running on a Vercel preview/branch deployment (which has Vercel authentication protection),
    // always fall back to the public canonical production domain for share links and OAuth!
    const isVercelPreview =
      origin.includes('-bixtysarthak2005-') ||
      origin.includes('-git-') ||
      (origin.includes('.vercel.app') && origin.replace('https://', '').split('-').length > 3);
    if (!isVercelPreview) {
      return origin;
    }
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, '')}`;
  }

  return CANONICAL_APP_URL;
}

/**
 * Checks if a given media URL or filename corresponds to a video format.
 */
export function isVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|mov|ogg|m4v|quicktime)(\?.*)?$/i.test(url);
}
