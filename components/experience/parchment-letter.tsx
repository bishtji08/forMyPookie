'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playPop } from '@/lib/audio-effects';
import type { ExperienceTheme } from '@/lib/types';
import { THEME_CONFIG, normalizeTheme } from '@/lib/types';

interface ParchmentLetterProps {
  title: string;
  badge?: string;
  senderName?: string;
  receiverName?: string;
  receiverNickname?: string;
  receiverNickName?: string;
  content: string;
  dateStamp?: string;
  secretNote?: string;
  showSignature?: boolean;
  theme?: ExperienceTheme | string;
  isDark?: boolean;
  accentColor?: string;
}

export function ParchmentLetter({
  title,
  badge = 'To the love of my life',
  senderName,
  receiverName,
  receiverNickname,
  receiverNickName,
  content,
  dateStamp,
  secretNote,
  showSignature = true,
  theme = 'light',
  isDark = false,
  accentColor,
}: ParchmentLetterProps) {
  const [secretOpen, setSecretOpen] = useState(false);

  const nickname = (receiverNickname || receiverNickName || '').trim();
  const activeTheme = normalizeTheme(theme);
  const cfg = THEME_CONFIG[activeTheme] || THEME_CONFIG.light;
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
        className={`rounded-3xl p-6 sm:p-10 shadow-2xl border transition-all duration-300 relative ${cfg.letter.background}`}
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
            className={`font-serif-title text-2xl sm:text-3xl font-bold tracking-tight mb-1 ${cfg.letter.heading}`}
          >
            {title}
          </h2>
          {receiverName && (
            <p className={`font-script text-2xl ${cfg.subColor}`}>
              To my {receiverName} ❤️
            </p>
          )}
        </div>

        {/* Letter Body Content with High-Contrast Typography */}
        <div className="relative">
          <div
            className={`font-serif-body text-lg sm:text-xl md:text-2xl leading-relaxed space-y-4 ${cfg.letter.text}`}
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
              className={`font-alex-brush italics leading-none tracking-tight ${cfg.subColor}`}
              style={{
                fontSize: 'clamp(0.75rem, 1vw, 1rem)',
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
              className={`w-full py-3 px-4 rounded-xl border ${cfg.secretToggleBg || (actualIsDark ? 'bg-[#231422] border-rose-500/40 text-[#7DD3FC]' : 'bg-[#FFF1F5] border-[#FDA4AF] text-[#F43F5E]')} text-left flex items-center justify-between text-sm font-semibold transition cursor-pointer`}
            >
              <span className={`font-playfair text-base sm:text-lg leading-relaxed ${cfg.subColor}`}>
                {secretOpen
                  ? `${nickname ? `${nickname} - ` : ''}Fold Secret Note 💌`
                  : `${nickname ? `${nickname} - ` : ''}✨ Tap to unfold a secret note…`}
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
                    <p className="font-dancing text-sm sm:text-base leading-relaxed">
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
