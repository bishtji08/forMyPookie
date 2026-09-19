'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playPop } from '@/lib/audio-effects';

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
  tagline = 'Handcrafted with all my love, for you',
  onHeartClick,
  className = '',
}: FooterProps) {
  const [clickCount, setClickCount] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const handleHeartInteraction = () => {
    playPop();
    const next = clickCount + 1;
    setClickCount(next);
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
    if (onHeartClick) onHeartClick();
  };

  const heartColor = accentColor || (isDark ? '#f472b6' : '#e11d48');

  return (
    <footer className={`relative z-10 py-8 px-4 sm:px-6 ${className}`}>
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center text-center gap-3">
        {/* Floating Romantic Pill */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleHeartInteraction}
          className={`relative cursor-pointer select-none inline-flex items-center gap-2.5 px-5 py-2 rounded-full backdrop-blur-md shadow-xs transition-all ${
            isDark
              ? 'bg-white/10 hover:bg-white/15 border border-white/15 text-white/90 shadow-pink-500/5'
              : 'bg-white/80 hover:bg-white border border-rose-200/70 text-rose-800 shadow-rose-200/30'
          }`}
        >
          {/* Subtle Heart Burst Animation on click */}
          <AnimatePresence>
            {showHeartBurst && (
              <motion.span
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -22, scale: 1.4 }}
                exit={{ opacity: 0 }}
                className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none text-base"
              >
                💖
              </motion.span>
            )}
          </AnimatePresence>

          <Heart
            className="w-4 h-4 fill-current transition-transform active:scale-125"
            style={{ color: heartColor }}
          />

          <span className="font-handwritten text-lg sm:text-xl font-medium tracking-wide">
            {tagline}
          </span>

          <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
        </motion.div>

        {/* Minimal Soft Brand Line */}
        <p
          className={`text-xs tracking-wider uppercase font-medium flex items-center gap-1.5 ${
            isDark ? 'text-white/40' : 'text-rose-400/70'
          }`}
        >
          <span>For My Pookie</span>
          <span>•</span>
          <span>Forever & Always</span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
