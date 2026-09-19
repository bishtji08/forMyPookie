'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ChevronDown, ChevronUp, Stamp } from 'lucide-react';
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
  theme = 'pink-dream',
  isDark = false,
  accentColor = '#e11d48',
}: ParchmentLetterProps) {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [secretOpen, setSecretOpen] = useState(false);

  const cfg = THEME_CONFIG[theme] || THEME_CONFIG['pink-dream'];
  const actualIsDark = isDark || cfg.isDark;

  const fontSizeClasses = {
    normal: 'text-base sm:text-lg leading-relaxed',
    large: 'text-lg sm:text-xl md:text-2xl leading-relaxed',
    xlarge: 'text-xl sm:text-2xl md:text-3xl leading-relaxed',
  };

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
        className={`relative rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl transition-all border ${cfg.cardBg}`}
      >
        {/* Top Wax Seal Ribbon Badge */}
        {badge && (
          <div className={`absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap z-20 ${cfg.badgeBg}`}>
            <span>{badge.includes('fight') ? '✨' : '💌'}</span>
            <span>{badge}</span>
          </div>
        )}

        {/* Header inside parchment */}
        <div className="text-center mt-2 mb-6">
          <h2
            className={`font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-1 ${
              actualIsDark ? 'text-white' : cfg.titleColor
            }`}
          >
            {title}
          </h2>
          {receiverName && (
            <p className={`font-script text-2xl ${cfg.subColor}`}>
              To my {receiverName} ❤️
            </p>
          )}
        </div>

        {/* Decorative Postage Stamp & Postmark */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 select-none opacity-80 pointer-events-none">
          <div
            className={`border border-dashed rounded-lg px-2.5 py-1 text-[11px] font-mono tracking-widest uppercase flex items-center gap-1 rotate-3 ${
              actualIsDark ? 'border-white/30 text-white/70' : 'border-black/20 text-black/60'
            }`}
          >
            <span>AIR MAIL</span>
            <Heart className="w-3 h-3 fill-current" />
          </div>
        </div>

        {/* Floating Font Size Control */}
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-black/10 dark:border-white/10">
          <div className={`flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase opacity-75 ${cfg.subColor}`}>
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Special Delivery</span>
          </div>

          <div className="flex items-center gap-1 rounded-full p-1 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
            <span className="text-[10px] uppercase font-bold px-1.5 opacity-60">Text</span>
            {(['normal', 'large', 'xlarge'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setFontSize(size)}
                className={`px-2 py-0.5 rounded-full text-xs font-bold transition ${
                  fontSize === size
                    ? `${cfg.badgeBg} shadow-2xs`
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>
        </div>

        {/* Letter Body Content with High-Contrast Typography */}
        <div className="relative">
          <div
            className={`font-serif-body ${fontSizeClasses[fontSize]} leading-relaxed space-y-4`}
            style={{
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
        {senderName && (
          <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
            <div className={`font-script text-2xl sm:text-3xl ${cfg.subColor}`}>
              Forever yours,
              <br />
              <span className="font-bold">{senderName}</span>
            </div>
            <span className="text-xs opacity-50 font-mono tracking-wide">
              {dateStamp || 'Special Delivery'}
            </span>
          </div>
        )}

        {/* Secret Fold-out Note (Interactive delight) */}
        {secretNote && (
          <div className="mt-8">
            <motion.button
              type="button"
              onClick={toggleSecret}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full py-3 px-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                actualIsDark
                  ? 'bg-white/5 hover:bg-white/10 border-white/15 text-white'
                  : 'bg-black/5 hover:bg-black/10 border-black/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className={`font-script text-xl font-bold ${cfg.subColor}`}>
                  {secretOpen ? 'Fold Secret Note 💌' : '✨ P.S. Tap to unfold a secret note…'}
                </span>
              </div>
              {secretOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </motion.button>

            <AnimatePresence>
              {secretOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className={`mt-2 p-5 rounded-2xl border ${cfg.secretBoxBg}`}>
                    <p className="font-script text-xl sm:text-2xl leading-relaxed">
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
