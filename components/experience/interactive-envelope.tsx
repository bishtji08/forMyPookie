'use client';

import { useState } from 'react';
import { playCelebration, playPop } from '@/lib/audio-effects';
import { Heart3D } from '@/components/experience/heart-3d';
import type { ExperienceTheme } from '@/lib/types';
import { THEME_CONFIG, normalizeTheme } from '@/lib/types';

interface InteractiveEnvelopeProps {
  receiverName?: string;
  senderName?: string;
  subtitle?: string;
  theme?: ExperienceTheme | string;
  isLocked?: boolean;
  onOpenAudio?: () => void;
  onOpen: () => void;
}

export function InteractiveEnvelope({
  receiverName = 'My Pookie',
  senderName,
  subtitle = 'a little something I made with my whole heart',
  theme = 'light',
  isLocked = false,
  onOpenAudio,
  onOpen,
}: InteractiveEnvelopeProps) {
  const [opening, setOpening] = useState(false);

  const activeTheme = normalizeTheme(theme);
  const cfg = THEME_CONFIG[activeTheme] || THEME_CONFIG.light;
  const displayName = receiverName?.trim() || 'My Pookie';

  const handleClick = () => {
    if (isLocked) {
      playPop();
      onOpen();
      return;
    }
    if (opening) return;
    setOpening(true);
    playPop();
    onOpenAudio?.();
    setTimeout(() => playCelebration(), 250);
    setTimeout(() => {
      onOpen();
    }, 700);
  };

  return (
    <div className="py-12 sm:py-16 px-4 flex flex-col items-center justify-center text-center select-none w-full relative z-10">
      {/* Title + Dark Heart */}
      <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
        <h1
          className={`font-serif-title text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight ${cfg.envelope.title}`}
        >
          For {displayName.startsWith('My') || displayName.startsWith('my') ? displayName : `My ${displayName}`}
        </h1>
        <span
          className="inline-block transform hover:scale-110 transition-transform cursor-pointer text-3xl sm:text-4xl select-none"
          onClick={handleClick}
        >
          🖤
        </span>
      </div>

      {/* Subtitle */}
      <p
        className={`font-playfairtext-xs sm:text-sm md:text-base font-light tracking-wider lowercase mb-8 sm:mb-12 ${cfg.envelope.subtitle}`}
      >
        {subtitle}
      </p>

      {/* The Physical Envelope Body */}
      <div
        onClick={handleClick}
        className={`relative w-[300px] sm:w-[420px] md:w-[460px] h-[190px] sm:h-[260px] md:h-[280px] rounded-[32px] sm:rounded-[36px] border flex items-center justify-center cursor-pointer group transition-all duration-300 hover:scale-[1.02] ${cfg.envelope.body}`}
      >
        {/* Triangle Flap */}
        <div
          style={{
            transform: opening ? 'rotateX(-180deg)' : 'rotateX(0deg)',
            transformOrigin: 'top center',
          }}
          className="absolute -top-px left-0 right-0 h-[100px] sm:h-[135px] md:h-[145px] origin-top transition-transform duration-700 pointer-events-none z-20"
        >
          <svg className="w-full h-full" viewBox="0 0 460 145" preserveAspectRatio="none">
            <path
              d="M0,0 L460,0 L230,145 Z"
              fill={cfg.envelope.flap}
              filter={cfg.mode === 'dark' ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.06))'}
            />
            <path
              d="M0,0 L230,145 L460,0"
              fill="none"
              stroke={cfg.mode === 'dark' ? 'rgba(56,189,248,0.6)' : 'rgba(253,164,175,0.85)'}
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Hidden Peeking Letter */}
        <div
          style={{
            opacity: opening ? 1 : 0,
            transform: opening ? 'translateY(-60px)' : 'translateY(0px)',
          }}
          className={`absolute inset-x-8 sm:inset-x-12 top-4 h-[120px] sm:h-[160px] rounded-2xl shadow-xl p-4 transition-all duration-500 z-10 flex flex-col justify-between pointer-events-none ${
            cfg.mode === 'dark'
              ? 'bg-[#0C1527] text-[#E2E8F0] border-2 border-[#38BDF8]/40 shadow-black/80'
              : 'bg-white text-slate-800 border-2 border-[#FDA4AF]'
          }`}
        >
          <div className={`h-2 w-1/3 rounded-full ${cfg.mode === 'dark' ? 'bg-[#7DD3FC]/30' : 'bg-rose-200'}`} />
          <p className={`font-script text-xl sm:text-2xl text-center ${cfg.subColor}`}>
            Unfolding our love story… ❤️
          </p>
          <div className={`h-2 w-1/2 rounded-full mx-auto ${cfg.mode === 'dark' ? 'bg-[#7DD3FC]/20' : 'bg-rose-100'}`} />
        </div>

        {/* Dark Heart Wax Seal Button */}
        <div className="relative z-30 flex flex-col items-center">
          <div
            className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full backdrop-blur-xs flex items-center justify-center transform group-hover:scale-110 transition-transform ${cfg.envelope.seal}`}
          >
            <span className="text-2xl sm:text-3xl select-none drop-shadow-md">🖤</span>
          </div>
        </div>
      </div>

      {/* Tap to open */}
      <p
        onClick={handleClick}
        className={`font-script text-2xl sm:text-3xl italic tracking-wide mt-6 sm:mt-8 animate-pulse cursor-pointer ${cfg.envelope.tapText}`}
      >
        tap to open 💌
      </p>
    </div>
  );
}
