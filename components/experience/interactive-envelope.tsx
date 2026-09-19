'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { playCelebration, playPop } from '@/lib/audio-effects';
import { GlossyHeart } from '@/components/experience/glossy-heart';
import type { ExperienceTheme } from '@/lib/types';
import { THEME_CONFIG } from '@/lib/types';

interface InteractiveEnvelopeProps {
  receiverName?: string;
  senderName?: string;
  subtitle?: string;
  theme?: ExperienceTheme;
  onOpen: () => void;
}

export function InteractiveEnvelope({
  receiverName = 'My Pookie',
  senderName,
  subtitle = 'a little something I made with my whole heart',
  theme = 'pink-dream',
  onOpen,
}: InteractiveEnvelopeProps) {
  const [opening, setOpening] = useState(false);
  const [hovered, setHovered] = useState(false);

  const cfg = THEME_CONFIG[theme] || THEME_CONFIG['pink-dream'];

  // Normalize display name: if receiverName already starts with "my" or similar, keep clean
  const displayName = receiverName?.trim() || 'My Pookie';

  const handleClick = () => {
    if (opening) return;
    setOpening(true);
    playPop();
    setTimeout(() => playCelebration(), 250);
    setTimeout(() => {
      onOpen();
    }, 1100);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 w-full max-w-xl mx-auto select-none py-6 sm:py-10">
      {/* Heading: "For My Pookie ❤️" with theme-aware high contrast text */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-center gap-3 sm:gap-4 mb-1.5 sm:mb-2 flex-wrap"
      >
        <h1 className={`font-serif-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight ${cfg.envTitleColor}`}>
          For {displayName.startsWith('My') || displayName.startsWith('my') ? displayName : `My ${displayName}`}
        </h1>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="cursor-pointer"
          onClick={handleClick}
        >
          <GlossyHeart size={44} className="sm:w-12 sm:h-12" />
        </motion.div>
      </motion.div>

      {/* Subtitle: "a little something I made with my whole heart" */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`font-body text-xs sm:text-sm md:text-base font-light tracking-wider lowercase mb-8 sm:mb-12 ${cfg.envSubColor}`}
      >
        {subtitle}
      </motion.p>

      {/* Aesthetic Envelope Container styled dynamically per theme */}
      <motion.div
        animate={
          opening
            ? { scale: [1, 1.04, 0.98], y: [0, -8, 12] }
            : { y: [0, -6, 0] }
        }
        transition={{
          y: { duration: 4, repeat: opening ? 0 : Infinity, ease: 'easeInOut' },
          scale: { duration: 0.6 },
        }}
        className="relative cursor-pointer group"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Soft Ambient Glow */}
        <div
          className="absolute -inset-2 rounded-[38px] blur-xl group-hover:blur-2xl transition duration-500 pointer-events-none opacity-60"
          style={{
            background: cfg.isDark
              ? 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(244,114,182,0.4) 0%, transparent 70%)',
          }}
        />

        {/* Envelope Body */}
        <div
          className={`relative w-[300px] sm:w-[440px] md:w-[480px] h-[195px] sm:h-[275px] md:h-[295px] rounded-[28px] sm:rounded-[36px] overflow-hidden flex items-center justify-center transition-all duration-300 ${cfg.envBox}`}
        >
          {/* Subtle Inner Pocket Lining */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/10 pointer-events-none" />

          {/* Letter Peeking Out animation when opening */}
          <motion.div
            initial={{ y: 0, opacity: 0 }}
            animate={opening ? { y: -130, opacity: 1 } : { y: 0, opacity: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: 'easeOut' }}
            className={`absolute inset-x-6 top-3 h-[88%] rounded-2xl shadow-xl p-5 flex flex-col items-center justify-center z-10 pointer-events-none ${
              cfg.isDark ? 'bg-[#1e152e] text-white border border-purple-400/40' : 'bg-[#fffdfa] text-slate-800 border border-rose-100/90'
            }`}
          >
            <p className="font-serif-display text-lg sm:text-xl font-bold">
              For {displayName} ❤️
            </p>
            <div className="w-10 h-0.5 bg-rose-400/50 rounded-full my-1.5" />
            <p className="font-handwritten text-base sm:text-lg opacity-80">
              Unfolding our love story…
            </p>
          </motion.div>

          {/* Envelope Top V-Flap */}
          <motion.div
            animate={
              opening
                ? { rotateX: -180, opacity: 0 }
                : { rotateX: 0, opacity: 1 }
            }
            transition={{ duration: 0.65, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top center' }}
            className="absolute top-0 left-0 right-0 w-full z-20 pointer-events-none"
          >
            <svg
              viewBox="0 0 460 145"
              className="w-full h-auto filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.08)]"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0 L460,0 L230,145 Z"
                fill={cfg.envFlapFill}
              />
              <path
                d="M0,0 L230,145 L460,0"
                fill="none"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="2"
              />
            </svg>
          </motion.div>

          {/* White Circular Seal Button with 3D Heart */}
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <motion.div
              animate={
                opening
                  ? { scale: [1, 1.45, 0], opacity: [1, 1, 0], rotate: 20 }
                  : { scale: hovered ? 1.1 : 1 }
              }
              transition={{ duration: 0.4 }}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/90 backdrop-blur-sm shadow-[0_6px_22px_rgba(0,0,0,0.25)] border-2 border-white flex items-center justify-center pointer-events-auto cursor-pointer group-hover:shadow-xl transition-shadow"
            >
              <GlossyHeart size={28} className="sm:w-8 sm:h-8" glow={false} />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* "tap to open 💌" in romantic cursive script matching theme color */}
      <motion.p
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        className={`font-script text-2xl sm:text-3xl italic tracking-wide mt-6 sm:mt-8 select-none cursor-pointer ${cfg.envTapColor}`}
        onClick={handleClick}
      >
        tap to open 💌
      </motion.p>
    </div>
  );
}
