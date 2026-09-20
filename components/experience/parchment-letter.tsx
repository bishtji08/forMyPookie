'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Stamp } from 'lucide-react';
import { playPop } from '@/lib/audio-effects';

import type { ExperienceTheme } from '@/lib/types';
import { THEME_CONFIG } from '@/lib/types';

interface ParchmentLetterProps {
  title: string;
  badge?: string;
  senderName?: string;
  receiverName?: string;
  content: string;
  dateStamp?: string;
  secretNote?: string;
  showSignature?: boolean;
  theme?: ExperienceTheme;
  isDark?: boolean;
  accentColor?: string;
}

export function ParchmentLetter({
  title,
  badge = 'To the love of my life',
  senderName,
  receiverName,
  content,
  dateStamp,
  secretNote,
  showSignature = true,
  theme = 'pink-dream',
  isDark = false,
  accentColor = '#e11d48',
}: ParchmentLetterProps) {
  const [secretOpen, setSecretOpen] = useState(false);

  const cfg = THEME_CONFIG[theme] || THEME_CONFIG['pink-dream'];
  const actualIsDark = isDark || cfg.isDark;

  const toggleSecret = () => {
    playPop();
    setSecretOpen((prev) => !prev);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4">
      {/* Parchment Paper Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className={`rounded-3xl p-6 sm:p-10 shadow-2xl border transition-all duration-300 relative ${cfg.cardBg}`}
      >
        {/* Top Wax Seal Ribbon Badge */}
        {badge && (
          <div className={`ribbon-badge absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap z-20 ${cfg.badgeBg}`}>
            <span>{badge.includes('fight') ? '✨' : '💌'}</span>
            <span>{badge}</span>
          </div>
        )}

        {/* Header inside parchment */}
        <div className="text-center mt-3 mb-6">
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-1"
            style={{
              fontFamily: cfg.typography.display,
              color: actualIsDark ? '#f5edff' : undefined,
            }}
          >
            {title}
          </h2>
          {receiverName && (
            <p
              className="text-2xl"
              style={{
                fontFamily: cfg.typography.script,
                color: actualIsDark ? '#c084fc' : undefined,
              }}
            >
              To my {receiverName} ❤️
            </p>
          )}
        </div>

        {/* Letter Body Content with High-Contrast Typography */}
        <div className="relative">
          <div
            className="text-lg sm:text-xl md:text-2xl leading-relaxed space-y-4"
            style={{
              fontFamily: cfg.typography.body,
              color: actualIsDark ? '#f5edff' : undefined,
            }}
          >
            {content ? (
              content.split('\n\n').map((para, pIdx) => (
                <p key={pIdx}>{para}</p>
              ))
            ) : (
              <p>[Your heartfelt letter will appear here.]</p>
            )}
          </div>
        </div>

        {/* Sign-off */}
        {showSignature && senderName && (
          <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 text-center">
            <p
              className="leading-none tracking-tight"
              style={{
                fontFamily: cfg.typography.script,
                color: actualIsDark ? '#f8f5ff' : cfg.subColor,
                fontSize: 'clamp(2.1rem, 4vw, 4rem)',
              }}
            >
              With all my love, {senderName}
            </p>
            {dateStamp && (
              <div className="mt-3 text-center">
                <span className="text-[10px] opacity-60 font-mono tracking-[0.22em] uppercase whitespace-nowrap">
                  {dateStamp}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Secret Fold-out Note (Interactive delight) */}
        {secretNote && (
          <div className="mt-6 pt-4">
            <button
              type="button"
              onClick={toggleSecret}
              className="w-full py-3 px-4 rounded-xl border border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/20 text-left flex items-center justify-between text-sm font-semibold transition cursor-pointer"
              style={{
                fontFamily: cfg.typography.script,
              }}
            >
              <span className="text-xl" style={{ color: actualIsDark ? '#f5edff' : undefined }}>
                {secretOpen ? 'Fold Secret Note 💌' : '✨ P.S. Tap to unfold a secret note…'}
              </span>
              <span className="text-xs">{secretOpen ? '▲' : '▼'}</span>
            </button>

            <AnimatePresence>
              {secretOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className={`mt-2 p-4 rounded-xl border ${cfg.secretBoxBg}`}>
                    <p className={`font-script text-xl leading-relaxed`}>
                      {secretNote}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
