'use client';

import { useState } from 'react';
import { playCelebration, playPop } from '@/lib/audio-effects';
import { Heart3D } from '@/components/experience/heart-3d';
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

  const cfg = THEME_CONFIG[theme] || THEME_CONFIG['pink-dream'];
  const actualIsDark = cfg.isDark;
  const displayName = receiverName?.trim() || 'My Pookie';

  const handleClick = () => {
    if (opening) return;
    setOpening(true);
    playPop();
    setTimeout(() => playCelebration(), 250);
    setTimeout(() => {
      onOpen();
    }, 700);
  };

  return (
    <div className="py-12 sm:py-16 px-4 flex flex-col items-center justify-center text-center select-none w-full relative z-10">
      {/* Title + 3D Heart */}
      <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
          style={{
            fontFamily: cfg.typography.display,
            color: actualIsDark ? '#f5edff' : undefined,
          }}
        >
          For {displayName.startsWith('My') || displayName.startsWith('my') ? displayName : `My ${displayName}`}
        </h1>
        <span
          className="inline-block transform hover:scale-110 transition-transform cursor-pointer"
          onClick={handleClick}
        >
          <Heart3D size={44} className="sm:w-12 sm:h-12 drop-shadow-md" />
        </span>
      </div>

      {/* Subtitle */}
      <p
        className="text-xs sm:text-sm md:text-base font-light tracking-wider lowercase mb-8 sm:mb-12"
        style={{
          fontFamily: cfg.typography.script,
          color: actualIsDark ? '#c084fc' : undefined,
        }}
      >
        {subtitle}
      </p>

      {/* The Physical Envelope Body */}
      <div
        onClick={handleClick}
        className={`relative w-[300px] sm:w-[420px] md:w-[460px] h-[190px] sm:h-[260px] md:h-[280px] rounded-[32px] sm:rounded-[36px] border flex items-center justify-center cursor-pointer group transition-all duration-300 hover:scale-[1.02] ${cfg.envBox}`}
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
              fill={cfg.envFlapFill}
              filter="drop-shadow(0 6px 10px rgba(0,0,0,0.06))"
            />
            <path
              d="M0,0 L230,145 L460,0"
              fill="none"
              stroke="rgba(255,255,255,0.85)"
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
          className="absolute inset-x-8 sm:inset-x-12 top-4 h-[120px] sm:h-[160px] bg-white rounded-2xl shadow-xl p-4 transition-all duration-500 z-10 flex flex-col justify-between pointer-events-none"
        >
          <div className="h-2 w-1/3 bg-rose-200 rounded-full" />
          <p className="font-script text-rose-500 text-xl sm:text-2xl text-center">
            Unfolding our love story… ❤️
          </p>
          <div className="h-2 w-1/2 bg-rose-100 rounded-full mx-auto" />
        </div>

        {/* 3D Heart Wax Seal Button */}
        <div className="relative z-30 flex flex-col items-center">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-rose-500/10 backdrop-blur-xs flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <Heart3D size={48} className="sm:w-16 sm:h-16 drop-shadow-lg" />
          </div>
        </div>
      </div>

      {/* Tap to open */}
      <p
        onClick={handleClick}
        className={`font-script text-2xl sm:text-3xl italic tracking-wide mt-6 sm:mt-8 animate-pulse cursor-pointer ${cfg.envTapColor}`}
      >
        tap to open 💌
      </p>
    </div>
  );
}
