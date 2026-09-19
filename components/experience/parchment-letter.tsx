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
      {/* Badge & Title */}
      <div className="text-center mb-6">
        {badge && (
          <p className="font-script text-2xl sm:text-3xl mb-1 text-rose-500 tracking-wide">
            {badge}
          </p>
        )}
        <h2
          className={`font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${
            actualIsDark ? 'text-white' : cfg.titleColor
          }`}
        >
          {title}
        </h2>
      </div>

      {/* Parchment Paper Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className={`relative rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl transition-all border ${cfg.cardBg}`}
      >
        {/* Decorative Postage Stamp & Postmark */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 select-none opacity-80 pointer-events-none">
          <div
            className={`border border-dashed rounded-lg px-2.5 py-1 text-[11px] font-mono tracking-widest uppercase flex items-center gap-1 rotate-3 ${
              isDark ? 'border-pink-300/40 text-pink-200' : 'border-rose-400/60 text-rose-600 bg-rose-50/60'
            }`}
          >
            <span>AIR MAIL</span>
            <Heart className="w-3 h-3 fill-current" />
          </div>
        </div>

        {/* Floating Font Size Control */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-rose-100/60">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-rose-400">
            <Heart className="w-3.5 h-3.5 fill-rose-400" />
            <span>To My {receiverName || 'Pookie'}</span>
          </div>

          <div className="flex items-center gap-1 bg-rose-50/80 rounded-full p-1 border border-rose-200/50">
            <span className="text-[10px] uppercase font-bold text-rose-400 px-1.5">Text</span>
            {(['normal', 'large', 'xlarge'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setFontSize(size)}
                className={`px-2 py-0.5 rounded-full text-xs font-bold transition ${
                  fontSize === size
                    ? 'bg-rose-500 text-white shadow-2xs'
                    : 'text-rose-600 hover:text-rose-900'
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
            <div className="font-script text-2xl sm:text-3xl text-rose-500">
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
              className={`w-full py-3 px-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
                actualIsDark
                  ? 'bg-white/5 hover:bg-white/10 border-pink-400/30 text-pink-200'
                  : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-400/30 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span className="font-script text-xl font-bold">
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
                  <div
                    className={`mt-2 p-5 rounded-2xl border ${
                      actualIsDark
                        ? 'bg-purple-950/60 border-purple-400/30 text-white'
                        : 'bg-amber-500/10 border-amber-400/40 text-amber-950'
                    }`}
                  >
                    <p className={`font-script text-xl sm:text-2xl leading-relaxed ${actualIsDark ? 'text-amber-200' : 'text-amber-900'}`}>
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
