'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Moon, Sun, Heart, Eye } from 'lucide-react';
import type { ExperienceTheme } from '@/lib/types';
import { THEME_CONFIG, normalizeTheme } from '@/lib/types';
import { Heart3D } from '@/components/experience/heart-3d';
import { FloatingAmbientHearts } from '@/components/experience/floating-ambient-hearts';

interface SenderThemeSelectorProps {
  value?: ExperienceTheme | string;
  onChange: (theme: ExperienceTheme) => void;
  receiverName?: string;
  senderName?: string;
}

export function SenderThemeSelector({
  value = 'light',
  onChange,
  receiverName = 'My Pookie',
  senderName = 'Someone Special',
}: SenderThemeSelectorProps) {
  const activeTheme = normalizeTheme(value);
  const cfg = THEME_CONFIG[activeTheme];

  const [previewTab, setPreviewTab] = useState<'unopened' | 'opened'>('unopened');

  const themeOptions: {
    key: ExperienceTheme;
    title: string;
    icon: typeof Sun;
    tagline: string;
    description: string;
    previewBg: string;
    envelopeBg: string;
    accentColor: string;
  }[] = [
    {
      key: 'light',
      title: 'Light Mode',
      icon: Sun,
      tagline: 'Soft blush pink & romantic stationery',
      description: 'Delicate pastel blush palette, crimson badges, soft pink washi tape, and warm serif typography.',
      previewBg: 'bg-gradient-to-br from-[#FFF1F6] via-[#FDF2F8] to-[#FFF7ED]',
      envelopeBg: 'bg-[#FDF4F9] border-[#FECDD3]',
      accentColor: '#F43F5E',
    },
    {
      key: 'dark',
      title: 'Dark Mode',
      icon: Moon,
      tagline: 'Midnight navy & cinematic letter',
      description: 'Deep midnight navy surfaces, sky blue script subtitles, royal blue badges, and glowing dark envelope.',
      previewBg: 'bg-gradient-to-b from-[#070B14] via-[#0A1122] to-[#070B14]',
      envelopeBg: 'bg-[#14223D] border-[#1E3A5F]',
      accentColor: '#7DD3FC',
    },
  ];

  return (
    <div className="space-y-5">
      {/* 2-Option Card Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {themeOptions.map((opt) => {
          const isSelected = activeTheme === opt.key;
          const Icon = opt.icon;

          return (
            <div
              key={opt.key}
              onClick={() => onChange(opt.key)}
              className={`rounded-3xl p-4 sm:p-5 text-left border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 shadow-xl ring-2 ring-rose-300/40 scale-[1.01]'
                  : 'border-rose-200/50 hover:border-rose-300 bg-white/70 dark:bg-slate-900/50 hover:shadow-md'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        opt.key === 'dark' ? 'bg-purple-950/60 text-purple-300' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {opt.title}
                      </h3>
                      <p className="text-[11px] text-rose-600 dark:text-rose-300 font-medium">
                        {opt.tagline}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500 text-white'
                        : 'border-slate-300 dark:border-slate-700 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  {opt.description}
                </p>
              </div>

              {/* Visual Mini Snapshot */}
              <div
                className={`rounded-2xl p-3 border overflow-hidden relative ${opt.previewBg} ${
                  opt.key === 'dark' ? 'border-white/10 text-white' : 'border-[#E8DFC8] text-[#2B2118]'
                }`}
              >
                {/* Mini Envelope & Card representation */}
                <div className="flex items-center justify-between gap-2">
                  <div className={`flex-1 rounded-xl p-2.5 border shadow-sm ${opt.envelopeBg}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-serif-title font-bold truncate">For My Pookie</span>
                      <span className="w-3 h-3 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <Heart className="w-2 h-2 text-rose-500 fill-rose-500" />
                      </span>
                    </div>
                    <div className="h-1 w-1/2 bg-rose-400/30 rounded-full mt-1.5" />
                  </div>

                  <div
                    className={`flex-1 rounded-xl p-2.5 border shadow-sm ${
                      opt.key === 'dark'
                        ? 'bg-[#17151C] border-rose-400/20 text-[#F4EFEB]'
                        : 'bg-white border-[#E8DFD0] text-[#2B2118]'
                    }`}
                  >
                    <span className="text-[10px] font-serif-title font-bold block truncate">Dear Cuitee</span>
                    <span className="text-[9px] font-script text-rose-500 block">forever yours</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Receiver Interactive Preview Frame */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 bg-slate-900 text-slate-100 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-rose-400" />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Live Receiver Experience Preview ({cfg.name})
              </p>
              <p className="text-[11px] text-slate-400">
                This is exactly how your receiver will experience your love letter.
              </p>
            </div>
          </div>

          {/* Toggle between Unopened and Opened */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setPreviewTab('unopened')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                previewTab === 'unopened'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💌 Unopened Envelope
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('opened')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                previewTab === 'opened'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📖 Opened Story
            </button>
          </div>
        </div>

        {/* Live Canvas */}
        <div
          className={`rounded-2xl p-6 sm:p-10 border transition-all duration-500 relative min-h-[360px] overflow-hidden flex flex-col justify-center items-center text-center ${cfg.canvasBg}`}
        >
          <FloatingAmbientHearts theme={activeTheme} />

          {previewTab === 'unopened' ? (
            /* Unopened Envelope View */
            <div className="relative z-10 flex flex-col items-center w-full max-w-sm mx-auto">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h4 className={`font-serif-title text-2xl sm:text-3xl font-bold tracking-tight ${cfg.envelope.title}`}>
                  For {receiverName || 'My Pookie'}
                </h4>
                <span className="text-2xl select-none">🖤</span>
              </div>
              <p className={`text-xs font-light lowercase mb-6 tracking-wide ${cfg.envelope.subtitle}`}>
                a little something I made with my whole heart
              </p>

              {/* Envelope Body */}
              <div
                className={`relative w-[260px] sm:w-[320px] h-[160px] sm:h-[190px] rounded-[26px] border flex items-center justify-center shadow-lg transition-transform hover:scale-[1.02] cursor-pointer ${cfg.envelope.body}`}
              >
                {/* SVG Flap */}
                <div className="absolute -top-px left-0 right-0 h-[80px] origin-top pointer-events-none z-20">
                  <svg className="w-full h-full" viewBox="0 0 460 145" preserveAspectRatio="none">
                    <path
                      d="M0,0 L460,0 L230,145 Z"
                      fill={cfg.envelope.flap}
                      filter={cfg.mode === 'dark' ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.06))'}
                    />
                    <path
                      d="M0,0 L230,145 L460,0"
                      fill="none"
                      stroke={cfg.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.95)'}
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                {/* Wax seal */}
                <div className={`relative z-30 w-11 h-11 rounded-full flex items-center justify-center ${cfg.envelope.seal}`}>
                  <span className="text-xl select-none drop-shadow-xs">🖤</span>
                </div>
              </div>

              <p className={`font-script text-xl italic tracking-wide mt-4 animate-pulse ${cfg.envelope.tapText}`}>
                tap to open 💌
              </p>
            </div>
          ) : (
            /* Opened Letter & Story View */
            <div className="relative z-10 w-full max-w-lg mx-auto space-y-4 text-left">
              <div className={`rounded-2xl p-5 border shadow-lg relative ${cfg.letter.background}`}>
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[11px] font-extrabold shadow-md whitespace-nowrap text-white drop-shadow-sm ${cfg.badgeBg}`}>
                  💌 From the bottom of my heart
                </div>
                <div className="text-center mt-2 mb-3">
                  <h4 className={`font-serif-title text-lg font-bold ${cfg.letter.heading}`}>
                    Things I Should Have Said Properly…
                  </h4>
                  <p className={`font-script text-lg ${cfg.subColor}`}>To my {receiverName || 'Cuitee'} ❤️</p>
                </div>
                <p className={`font-serif-body text-xs sm:text-sm leading-relaxed ${cfg.letter.text}`}>
                  I know I messed up and said the wrong thing. You deserved patience, gentleness, and better from me.
                  I genuinely promise to do better every single day.
                </p>
                <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                  <span className={`font-script text-xl ${cfg.subColor}`}>With all my love, {senderName || 'Anuj'}</span>
                  <span className="text-[10px] opacity-60 font-mono">Special Delivery</span>
                </div>
              </div>

              {/* Date Card Snippet */}
              <div className={`rounded-2xl p-4 border text-center ${cfg.cards.background} ${cfg.cards.border}`}>
                <p className="font-serif-title text-sm font-bold mb-1">Can I take you out?</p>
                <p className={`font-script text-base ${cfg.subColor} mb-3`}>Coffee? Dinner? A walk? You choose.</p>
                <div className="flex gap-2 justify-center">
                  <span className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs ${cfg.buttons.primary}`}>
                    ❤️ YES
                  </span>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/80 text-white">
                    🥺 MAYBE
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
