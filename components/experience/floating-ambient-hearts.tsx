'use client';

import React, { useMemo } from 'react';
import { Heart3D } from './heart-3d';
import type { ExperienceTheme } from '@/lib/types';
import { normalizeTheme } from '@/lib/types';

interface FloatingAmbientHeartsProps {
  theme?: ExperienceTheme | string;
}

export function FloatingAmbientHearts({ theme = 'light' }: FloatingAmbientHeartsProps) {
  const activeTheme = normalizeTheme(theme);
  const isDark = activeTheme === 'dark';

  const particles = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const left = ((i * 17 + 5) % 90) + 5;
      const duration = 11 + (i % 5) * 2.5;
      const delay = (i * 1.1) % 7;
      const size = 18 + (i % 4) * 6;
      const isHeart = i % 4 !== 3;
      const flower = isDark ? (i % 2 === 0 ? '✨' : '⭐') : '🌸';

      return {
        id: i,
        left: `${left}%`,
        duration: `${duration}s`,
        delay: `${delay}s`,
        size,
        isHeart,
        flower,
      };
    });
  }, [isDark]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="ambient-heart"
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        >
          {p.isHeart ? (
            <Heart3D
              size={p.size}
              className={isDark ? 'drop-shadow-[0_0_8px_rgba(224,122,148,0.5)]' : 'drop-shadow-xs'}
            />
          ) : (
            <span
              className={`text-xl select-none inline-block filter ${
                isDark ? 'opacity-60 text-amber-200 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]' : 'opacity-45 drop-shadow'
              }`}
            >
              {p.flower}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
