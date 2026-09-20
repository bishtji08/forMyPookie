import type { ExperienceTheme, ThemeConfig } from './theme-types';

export const THEME_CONFIG: Record<ExperienceTheme, ThemeConfig> = {
  light: {
    id: 'light',
    name: 'Light Mode',
    mode: 'light',
    description: 'Soft blush pink & romantic stationery',

    colors: {
      background: '#FFF1F6',
      backgroundSecondary: '#FDF2F8',
      surface: '#FFFFFF',
      surfaceElevated: '#FFF9FB',
      surfaceMuted: '#FCE7F3',

      text: '#1E293B',
      textSecondary: '#475569',
      textMuted: '#94A3B8',

      accent: '#F43F5E',
      accentHover: '#E11D48',
      accentSoft: 'rgba(244, 63, 94, 0.12)',

      border: '#FECDD3',
      borderStrong: '#FDA4AF',

      success: '#16A34A',
      warning: '#F59E0B',
      danger: '#E11D48',
    },

    typography: {
      display: 'font-serif-title font-bold tracking-tight text-[#2B0B1E]',
      heading: 'font-serif-title font-semibold text-[#2B0B1E]',
      body: 'font-serif-body leading-relaxed text-[#334155]',
      script: 'font-script text-[#F43F5E]',
      button: 'font-sans-body font-semibold tracking-wide',
      metadata: 'font-sans-body text-xs font-mono tracking-wider text-[#94A3B8]',
      titleFont: 'font-serif-title',
      headingFont: 'font-serif-title',
      bodyFont: 'font-serif-body',
      scriptFont: 'font-script',
      uiFont: 'font-sans-body',
    },

    envelope: {
      body: 'bg-[#FDF4F9] border-2 border-rose-300 shadow-[0_15px_50px_rgba(244,63,94,0.18)]',
      flap: '#FFFFFF',
      seal: 'bg-[#FCE7F3] shadow-pink-200/50 text-black',
      border: 'border-2 border-rose-300',
      shadow: 'shadow-[0_15px_50px_rgba(244,63,94,0.18)]',
      title: 'text-[#2B0B1E]',
      subtitle: 'text-[#E11D48] font-medium',
      tapText: 'text-[#E11D48] font-bold',
    },

    letter: {
      background: 'bg-[#FFFFFF] border-2 border-rose-300 shadow-[0_15px_40px_rgba(244,63,94,0.12),0_4px_12px_rgba(0,0,0,0.05)]',
      border: 'border-2 border-rose-300',
      shadow: 'shadow-[0_15px_40px_rgba(244,63,94,0.12)]',
      text: 'text-[#334155]',
      heading: 'text-[#2B0B1E]',
    },

    cards: {
      background: 'bg-[#FFFFFF] text-[#334155]',
      border: 'border-2 border-rose-300',
      shadow: 'shadow-lg shadow-pink-200/50',
      hover: 'hover:-translate-y-1 hover:border-rose-400 hover:shadow-xl transition-all duration-300',
    },

    gallery: {
      background: 'bg-[#FFF5F8]',
      border: 'border-2 border-rose-300',
      overlay: 'bg-gradient-to-t from-black/80 via-black/30 to-transparent',
    },

    buttons: {
      primary: 'bg-[#E11D48] bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-rose-600 text-white font-extrabold border-2 border-rose-300 shadow-xl shadow-rose-500/30 active:scale-[0.98] transition',
      secondary: 'bg-white hover:bg-rose-50 text-[#1E293B] border-2 border-rose-300 shadow-xs active:scale-[0.98] transition',
      ghost: 'hover:bg-rose-50 text-[#475569] transition',
    },

    decorations: {
      hearts: 'text-rose-500',
      flowers: '🌸',
      particles: '#F43F5E',
      glow: 'rgba(244, 63, 94, 0.15)',
    },

    effects: {
      shadow: 'shadow-xl shadow-rose-200/40',
      glow: 'drop-shadow-[0_0_12px_rgba(244,63,94,0.25)]',
      blur: 'backdrop-blur-md',
      texture: 'paper-texture',
    },

    animations: {
      envelopeOpen: 'transition-all duration-700 ease-out',
      reveal: 'transition-all duration-500 ease-in-out',
      floating: 'animate-float',
      hover: 'transition-transform duration-300 hover:scale-[1.02]',
    },

    spacing: {
      section: 'py-12 px-4 sm:px-8',
      card: 'p-6 sm:p-10',
    },

    radius: {
      card: 'rounded-3xl',
      button: 'rounded-xl',
      badge: 'rounded-full',
    },

    // High-level utility tokens for direct component usage
    canvasBg: 'bg-gradient-to-br from-[#FFF1F6] via-[#FDF2F8] to-[#FFF7ED] text-[#1E293B] border-2 border-rose-300',
    unopenedBg: 'from-[#FFF1F6] via-[#FDF2F8] to-[#FFF7ED]',
    openedBg: 'from-[#FFF1F6] via-[#FDF2F8] to-[#FFF7ED]',
    gradient: 'from-[#FFF1F6] via-[#FDF2F8] to-[#FFF7ED]',
    accent: '#F43F5E',
    isDark: false,
    titleColor: 'text-[#2B0B1E]',
    subColor: 'text-[#F43F5E]',
    textColor: 'text-[#334155]',
    cardBg: 'bg-[#FFFFFF] text-[#334155] border-2 border-rose-300 shadow-[0_15px_40px_rgba(244,63,94,0.12),0_4px_12px_rgba(0,0,0,0.05)]',
    jokeCardBg: 'bg-[#FFFFFF] text-[#334155] border-2 border-rose-300 shadow-md hover:border-rose-400',
    inviteBg: 'bg-white text-[#1E293B] border-2 border-rose-300 shadow-2xl shadow-rose-200/50',
    dateBoxBg: 'bg-[#FFF5F8] border-2 border-rose-300 text-[#1E293B] shadow-inner',
    dateCardBg: 'bg-white text-slate-800 hover:bg-rose-50 border-2 border-rose-200 shadow-xs hover:border-rose-400',
    dateCardActive: 'bg-[#E11D48] bg-gradient-to-r from-rose-600 to-pink-500 text-white border-2 border-rose-600 shadow-lg shadow-rose-500/30 scale-[1.03]',
    badgeBg: 'bg-[#E11D48] bg-gradient-to-r from-rose-600 to-pink-500 text-white font-extrabold border-2 border-white shadow-xl shadow-rose-900/30 ring-2 ring-rose-400',
    buttonPrimary: 'bg-[#E11D48] bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-rose-600 text-white font-extrabold border-2 border-rose-300 shadow-xl shadow-rose-500/30 active:scale-[0.98]',
    secretBoxBg: 'border-2 border-[#F59E0B] bg-[#FFFBEB] text-[#B45309]',
    secretToggleBg: 'bg-[#FFF1F5] border-2 border-rose-300 text-[#E11D48] hover:bg-[#FFE4E6]',
    inputBg: 'bg-white border-2 border-rose-300 text-[#1E293B] placeholder-slate-400 focus:ring-rose-500',
    tapeColor: 'bg-[#FBCFE8]',
    polaroidInnerBg: 'bg-[#FDF2F8]',
    polaroidCaptionColor: 'text-[#E11D48]',
    envBox: 'bg-[#FDF4F9] border-2 border-rose-300 shadow-[0_15px_50px_rgba(244,63,94,0.18)]',
    envFlapFill: '#FFFFFF',
    envTitleColor: 'text-[#2B0B1E]',
    envSubColor: 'text-[#E11D48]',
    envTapColor: 'text-[#E11D48]',
    sealStyle: 'bg-[#FCE7F3] shadow-pink-200/50',
    paperTexture: 'bg-[#FFFFFF] shadow-[0_15px_40px_rgba(244,63,94,0.12)]',
    cardStyle: 'rounded-3xl',
    glassBg: 'bg-white/95 border-2 border-rose-300',
  },

  dark: {
    id: 'dark',
    name: 'Dark Mode',
    mode: 'dark',
    description: 'Midnight navy & cinematic letter experience',

    colors: {
      background: '#070B14',
      backgroundSecondary: '#0A1122',
      surface: '#0C1527',
      surfaceElevated: '#0F1A30',
      surfaceMuted: '#131F37',

      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',

      accent: '#7DD3FC',
      accentHover: '#38BDF8',
      accentSoft: 'rgba(125, 211, 252, 0.15)',

      border: '#1E3A5F',
      borderStrong: '#2563EB',

      success: '#22C55E',
      warning: '#F59E0B',
      danger: '#EF4444',
    },

    typography: {
      display: 'font-serif-title font-bold tracking-tight text-white',
      heading: 'font-serif-title font-semibold text-white',
      body: 'font-serif-body leading-relaxed text-[#E2E8F0]',
      script: 'font-script text-[#7DD3FC]',
      button: 'font-sans-body font-semibold tracking-wide',
      metadata: 'font-sans-body text-xs font-mono tracking-wider text-[#94A3B8]',
      titleFont: 'font-serif-title',
      headingFont: 'font-serif-title',
      bodyFont: 'font-serif-body',
      scriptFont: 'font-script',
      uiFont: 'font-sans-body',
    },

    envelope: {
      body: 'bg-gradient-to-b from-[#162646] via-[#14223D] to-[#0E182B] border-2 border-blue-500/40 shadow-[0_0_60px_rgba(37,99,235,0.35)]',
      flap: '#162646',
      seal: 'bg-[#2D1B33]/90 shadow-[0_0_20px_rgba(45,27,51,0.6)] text-black',
      border: 'border-2 border-blue-500/40',
      shadow: 'shadow-[0_0_60px_rgba(37,99,235,0.35)]',
      title: 'text-white',
      subtitle: 'text-[#7DD3FC] font-medium',
      tapText: 'text-[#38BDF8] font-bold drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]',
    },

    letter: {
      background: 'bg-[#0C1527]/95 border-2 border-blue-500/40 shadow-[0_0_30px_rgba(37,99,235,0.2),0_15px_45px_rgba(0,0,0,0.85)] backdrop-blur-md',
      border: 'border-2 border-blue-500/40',
      shadow: 'shadow-[0_0_30px_rgba(37,99,235,0.2),0_15px_45px_rgba(0,0,0,0.85)]',
      text: 'text-[#E2E8F0]',
      heading: 'text-white',
    },

    cards: {
      background: 'bg-[#0F1A30] text-[#E2E8F0]',
      border: 'border-2 border-blue-500/40',
      shadow: 'shadow-xl shadow-black/70',
      hover: 'hover:-translate-y-1 hover:border-blue-400/70 hover:shadow-blue-950/60 transition-all duration-300',
    },

    gallery: {
      background: '#070B14',
      border: 'border-2 border-blue-500/40',
      overlay: 'bg-gradient-to-t from-black/90 via-black/40 to-transparent',
    },

    buttons: {
      primary: 'bg-[#2563EB] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-blue-600 text-white font-extrabold border-2 border-blue-400 shadow-xl shadow-blue-600/40 active:scale-[0.98] transition',
      secondary: 'bg-white/10 hover:bg-white/15 text-[#E2E8F0] border-2 border-white/20 shadow-sm active:scale-[0.98] transition',
      ghost: 'hover:bg-white/5 text-[#94A3B8] transition',
    },

    decorations: {
      hearts: 'text-rose-500 drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]',
      flowers: '🌸',
      particles: '#7DD3FC',
      glow: 'rgba(37, 99, 235, 0.25)',
    },

    effects: {
      shadow: 'shadow-2xl shadow-black/90',
      glow: 'drop-shadow-[0_0_16px_rgba(37,99,235,0.35)]',
      blur: 'backdrop-blur-lg',
      texture: 'paper-texture',
    },

    animations: {
      envelopeOpen: 'transition-all duration-700 ease-out',
      reveal: 'transition-all duration-500 ease-in-out',
      floating: 'animate-float',
      hover: 'transition-transform duration-300 hover:scale-[1.02]',
    },

    spacing: {
      section: 'py-12 px-4 sm:px-8',
      card: 'p-6 sm:p-10',
    },

    radius: {
      card: 'rounded-3xl',
      button: 'rounded-xl',
      badge: 'rounded-full',
    },

    // High-level utility tokens for direct component usage
    canvasBg: 'bg-gradient-to-b from-[#070B14] via-[#0A1122] to-[#070B14] text-[#F8FAFC] border-2 border-blue-500/40',
    unopenedBg: 'from-[#070B14] via-[#0A1122] to-[#070B14]',
    openedBg: 'from-[#070B14] via-[#0A1122] to-[#070B14]',
    gradient: 'from-[#070B14] via-[#0A1122] to-[#070B14]',
    accent: '#7DD3FC',
    isDark: true,
    titleColor: 'text-white',
    subColor: 'text-[#7DD3FC]',
    textColor: 'text-[#E2E8F0]',
    cardBg: 'bg-[#0C1527] text-[#E2E8F0] border-2 border-blue-500/40 shadow-[0_0_30px_rgba(37,99,235,0.2),0_15px_45px_rgba(0,0,0,0.85)]',
    jokeCardBg: 'bg-[#0F1A30] text-[#E2E8F0] border-2 border-blue-500/40 shadow-lg hover:border-blue-400/70',
    inviteBg: 'bg-[#0C1527] text-white border-2 border-blue-500/50 shadow-[0_0_35px_rgba(37,99,235,0.25),0_20px_50px_rgba(0,0,0,0.9)]',
    dateBoxBg: 'bg-[#0B1325] border-2 border-blue-500/40 text-[#E2E8F0] shadow-inner',
    dateCardBg: 'bg-[#131F37] text-white hover:bg-[#1A2B4C] border-2 border-slate-700 hover:border-blue-400/60 shadow-md',
    dateCardActive: 'bg-[#2563EB] bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-2 border-blue-300 shadow-lg shadow-blue-500/50 scale-[1.03]',
    badgeBg: 'bg-[#1D4ED8] bg-gradient-to-r from-blue-700 to-blue-600 text-white font-extrabold border-2 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.6)] ring-1 ring-blue-300',
    buttonPrimary: 'bg-[#2563EB] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-blue-600 text-white font-extrabold border-2 border-blue-400 shadow-xl shadow-blue-600/40 active:scale-[0.98]',
    secretBoxBg: 'border-2 border-amber-400/80 bg-[#121B2D] text-[#FCD34D]',
    secretToggleBg: 'bg-[#181126] border-2 border-rose-500/50 text-[#7DD3FC] hover:bg-[#201533]',
    inputBg: 'bg-[#0A1122] border-2 border-blue-500/40 text-white placeholder-slate-400 focus:ring-[#2563EB]',
    tapeColor: 'bg-[#93C5FD]',
    polaroidInnerBg: 'bg-[#334155]',
    polaroidCaptionColor: 'text-[#E11D48]',
    envBox: 'bg-gradient-to-b from-[#162646] via-[#14223D] to-[#0E182B] border-2 border-blue-500/40 shadow-[0_0_60px_rgba(37,99,235,0.35)]',
    envFlapFill: '#162646',
    envTitleColor: 'text-white',
    envSubColor: 'text-[#7DD3FC]',
    envTapColor: 'text-[#38BDF8]',
    sealStyle: 'bg-[#2D1B33]/90 shadow-[0_0_20px_rgba(45,27,51,0.6)]',
    paperTexture: 'bg-[#0C1527] shadow-[0_10px_40px_rgba(0,0,0,0.6)]',
    cardStyle: 'rounded-3xl',
    glassBg: 'bg-[#0C1527]/95 border-2 border-blue-500/40 text-white',
  },
};
