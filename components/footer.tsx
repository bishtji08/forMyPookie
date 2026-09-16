'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ExternalLink } from 'lucide-react';

export interface FooterProps {
  isDark?: boolean;
  accentColor?: string;
  tagline?: string;
  onHeartClick?: () => void;
  className?: string;
}

export function Footer({
  isDark = false,
  accentColor,
  tagline = 'From my heart, to yours',
  onHeartClick,
  className = '',
}: FooterProps) {
  const isClickable = Boolean(onHeartClick);

  return (
    <footer
      className={`relative z-10 border-t ${
        isDark
          ? 'border-white/10 bg-black/30 backdrop-blur-md'
          : 'border-rose-200/60 bg-white/40 backdrop-blur-md'
      } ${className}`}
    >
      {/* Subtle ambient top-highlight glow */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${
          isDark
            ? 'from-transparent via-white/25 to-transparent'
            : 'from-transparent via-rose-300/80 to-transparent'
        }`}
      />

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col items-center justify-center text-center gap-5">
        {/* Heart tagline badge (supports easter egg clicking if provided) */}
        {isClickable ? (
          <button
            type="button"
            onClick={onHeartClick}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full transition-all cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white/90 shadow-sm'
                : 'bg-white/80 hover:bg-white border border-rose-200/80 hover:border-rose-300 text-rose-700 shadow-xs hover:shadow-sm'
            }`}
          >
            <Heart
              className="w-3.5 h-3.5 fill-current animate-pulse"
              style={{ color: accentColor || (isDark ? '#f472b6' : '#e85d8d') }}
            />
            <span
              className={`text-xs sm:text-sm font-medium tracking-wide ${
                isDark ? 'text-white/90' : 'text-rose-700'
              }`}
            >
              {tagline}
            </span>
          </button>
        ) : (
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors ${
              isDark
                ? 'bg-white/10 border border-white/20 text-white/90 shadow-sm'
                : 'bg-white/80 border border-rose-200/80 text-rose-700 shadow-xs hover:border-rose-300'
            }`}
          >
            <Heart
              className="w-3.5 h-3.5 fill-current animate-pulse"
              style={{ color: accentColor || (isDark ? '#f472b6' : '#e85d8d') }}
            />
            <span
              className={`text-xs sm:text-sm font-medium tracking-wide ${
                isDark ? 'text-white/90' : 'text-rose-700'
              }`}
            >
              {tagline}
            </span>
          </div>
        )}

        {/* Decorative divider */}
        <div
          className={`w-12 h-px ${isDark ? 'bg-white/15' : 'bg-rose-200/70'}`}
        />

        {/* Rights & Developer Attribution */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm font-normal ${
            isDark ? 'text-white/70' : 'text-rose-700/80'
          }`}
        >
          <p>
            All rights reserved © 2026,{' '}
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-rose-800'}`}>
              For My Pookie
            </span>
          </p>

          <span className={`hidden sm:inline ${isDark ? 'text-white/30' : 'text-rose-300'}`}>
            •
          </span>

          <p className="inline-flex items-center gap-1.5">
            <span>Developed by</span>
            <Link
              href="https://gavinm.net"
              target="_blank"
              rel="noopener noreferrer"
              className={`group inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs hover:shadow-xs transition-all duration-200 ${
                isDark
                  ? 'text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30'
                  : 'text-rose-700 hover:text-rose-950 bg-rose-50 hover:bg-rose-100/80 border-rose-200/80'
              }`}
            >
              <span>Sarthak Bisht</span>
              <ExternalLink
                className={`w-3 h-3 transition-colors ${
                  isDark
                    ? 'text-white/60 group-hover:text-white'
                    : 'text-rose-400 group-hover:text-rose-600'
                }`}
              />
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
