'use client';

import React, { useMemo } from 'react';
import { Heart3D } from './heart-3d';
import type { ExperienceTheme } from '@/lib/types';

interface FloatingAmbientHeartsProps {
  theme?: ExperienceTheme;
}

export function FloatingAmbientHearts({ theme = 'pink-dream' }: FloatingAmbientHeartsProps) {
  const particles = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const left = ((i * 17 + 5) % 90) + 5;
      const duration = 11 + (i % 5) * 2.5;
      const delay = (i * 1.1) % 7;
      const size = 18 + (i % 4) * 6;
      const isHeart = i % 4 !== 3;
      const flower =
        theme === 'starry-romance' ? '⭐' : theme === 'sunset-love' ? '🧡' : '🌸';

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
  }, [theme]);

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
            <Heart3D size={p.size} className="drop-shadow-xs" />
          ) : (
            <span className="text-xl opacity-45 select-none inline-block filter drop-shadow">
              {p.flower}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
