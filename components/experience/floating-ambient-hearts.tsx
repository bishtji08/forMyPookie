'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlossyHeart } from './glossy-heart';
import type { ExperienceTheme } from '@/lib/types';

interface FloatingAmbientHeartsProps {
  theme?: ExperienceTheme;
  count?: number;
}

/**
 * Continuous ambient background animation of floating 3D glossy hearts and romantic particles.
 * Drifts smoothly behind all cards and sections across the entire page without blocking interaction.
 */
export function FloatingAmbientHearts({ theme = 'pink-dream', count = 18 }: FloatingAmbientHeartsProps) {
  // Deterministic particle generation to avoid hydration mismatch between SSR & client
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // 70% 3D glossy hearts of various sizes, 30% theme-matching dreamy particles
      const isHeart = i % 4 !== 3;
      const size = 18 + (i % 4) * 6; // 18px, 24px, 30px, 36px
      // Distribute evenly horizontally with subtle jitter
      const left = ((i * 17 + 5) % 90) + 5; // 5% to 95%
      const duration = 12 + (i % 5) * 2.5; // 12s to 22s
      const delay = (i * 1.1) % 9; // staggered start
      const drift = (i % 2 === 0 ? 1 : -1) * (20 + (i % 3) * 15);
      const symbol =
        theme === 'starry-romance'
          ? (i % 2 === 0 ? '✨' : '⭐')
          : theme === 'sunset-love'
          ? (i % 2 === 0 ? '✨' : '🧡')
          : (i % 2 === 0 ? '🌸' : '✨');

      return {
        id: i,
        isHeart,
        size,
        left: `${left}%`,
        duration,
        delay,
        drift,
        symbol,
      };
    });
  }, [count, theme]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute will-change-transform"
          style={{ left: p.left }}
          initial={{ y: '105vh', x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: '-10vh',
            x: [0, p.drift, -p.drift * 0.7, 0],
            opacity: [0, 0.65, 0.85, 0.65, 0],
            rotate: p.drift > 0 ? [0, 25, -20, 10] : [0, -25, 20, -10],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        >
          {p.isHeart ? (
            <GlossyHeart
              size={p.size}
              glow={p.size > 22}
              className="drop-shadow-md hover:scale-110 transition-transform"
            />
          ) : (
            <span className="text-xl sm:text-2xl opacity-45 select-none inline-block filter drop-shadow">
              {p.symbol}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
