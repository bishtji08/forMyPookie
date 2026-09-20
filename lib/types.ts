export type UserRole = 'admin' | 'sender' | 'receiver';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile_image: string | null;
  status: 'active' | 'disabled' | 'blocked';
  created_at: string;
  updated_at: string;
}

export type ExperienceTheme =
  | 'pink-dream'
  | 'lavender-night'
  | 'sunset-love'
  | 'minimal-cream'
  | 'starry-romance';

export type ExperienceStatus = 'draft' | 'active' | 'inactive' | 'expired';
export type ResponseStatus = 'yes' | 'maybe' | 'no';

export interface Experience {
  id: string;
  secure_token: string;
  sender_id: string;
  receiver_id: string | null;
  receiver_name: string;
  receiver_nickname: string;
  sender_name: string;
  relationship: string;
  apology_message: string;
  love_letter: string;
  final_letter: string;
  theme: ExperienceTheme;
  music_url: string | null;
  status: ExperienceStatus;
  is_opened: boolean;
  opened_at: string | null;
  last_accessed_at: string | null;
  response_status: ResponseStatus | null;
  date_options: string[];
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  experience_id: string;
  title: string;
  date: string | null;
  location: string | null;
  media_url: string | null;
  media_type: 'image' | 'video';
  caption: string;
  category: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FunnyMoment {
  id: string;
  experience_id: string;
  title: string;
  description: string;
  image_url: string | null;
  date: string | null;
  sort_order: number;
  created_at: string;
}

export interface LoveReason {
  id: string;
  experience_id: string;
  title: string;
  description: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  experience_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string;
  category: string;
  sort_order: number;
  created_at: string;
}

export interface Response {
  id: string;
  experience_id: string;
  receiver_id: string;
  response: ResponseStatus;
  note: string | null;
  date_activity: string | null;
  date_time: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  experience_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'opened' | 'response' | 'message' | 'system';
  title: string;
  body: string | null;
  experience_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_id: string | null;
  experience_id: string | null;
  reason: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlockedUser {
  id: string;
  user_id: string;
  reason: string;
  blocked_by: string;
  created_at: string;
}

export interface DateRequest {
  id: string;
  experience_id: string;
  receiver_id: string;
  activity: string;
  date_time: string | null;
  notes: string | null;
  created_at: string;
}

export interface ThemeTypography {
  display: string;
  heading: string;
  body: string;
  script: string;
  button: string;
  metadata: string;
}

export interface ThemeStyleConfig {
  id: ExperienceTheme;
  name: string;
  description: string;
  gradient: string;
  accent: string;
  isDark: boolean;
  typography: ThemeTypography;
  paperTexture: string;
  sealStyle: string;
  cardStyle: string;
  canvasBg: string;
  unopenedBg: string;
  openedBg: string;
  envBox: string;
  envFlapFill: string;
  envTitleColor: string;
  envSubColor: string;
  envTapColor: string;
  titleColor: string;
  textColor: string;
  subColor: string;
  cardBg: string;
  jokeCardBg: string;
  inviteBg: string;
  dateBoxBg: string;
  dateCardBg: string;
  dateCardActive: string;
  badgeBg: string;
  buttonPrimary: string;
  secretBoxBg: string;
  inputBg: string;
  tapeColor: string;
  polaroidInnerBg: string;
  glassBg: string;
  sectionGlow: string;
  decorativeIcon: string;
}

export const THEME_CONFIG: Record<ExperienceTheme, ThemeStyleConfig> = {
  'pink-dream': {
    id: 'pink-dream',
    name: 'Pink Dream',
    description: 'Soft romantic stationery',
    gradient: 'from-[#fbf2fc] via-[#faebf7] to-[#fff5ea]',
    accent: '#e85d8d',
    isDark: false,
    typography: {
      display: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
      heading: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
      body: '"Lora", "Cormorant Garamond", Georgia, serif',
      script: '"Great Vibes", "Dancing Script", cursive',
      button: '"Poppins", sans-serif',
      metadata: '"Poppins", sans-serif',
    },
    paperTexture: 'bg-[#fffefb] shadow-[0_20px_50px_rgba(244,114,182,0.15)]',
    sealStyle: 'bg-rose-500/10 shadow-rose-300/30',
    cardStyle: 'rounded-3xl',
    canvasBg: 'bg-gradient-to-br from-[#fbf2fc] via-[#faebf7] to-[#fff5ea] text-[#3f1d2e] border-pink-200/80',
    unopenedBg: 'from-[#fbf2fc] via-[#faebf7] to-[#fff5ea]',
    openedBg: 'from-[#fbf2fc] via-[#faebf7] to-[#fff5ea]',
    envBox: 'bg-gradient-to-b from-[#fbf2fc] via-[#f7eaf8] to-[#f3e3f5] border-white shadow-[0_25px_60px_-15px_rgba(225,175,215,0.55)]',
    envFlapFill: '#faedf9',
    envTitleColor: 'text-[#3f1d2e]',
    envSubColor: 'text-[#d4789b]',
    envTapColor: 'text-[#d4789b]',
    titleColor: 'text-[#3f1d2e]',
    textColor: 'text-[#2b101e]',
    subColor: 'text-[#d4789b]',
    cardBg: 'bg-[#fffefb] text-[#2b101e] border-[#f2d9e6] shadow-[0_20px_50px_rgba(244,114,182,0.15)]',
    jokeCardBg: 'bg-[#fffdfd] text-[#2b101e] border-[#f2d9e6] shadow-sm',
    inviteBg: 'bg-white/85 text-[#3f1d2e] border-pink-200/90 shadow-2xl',
    dateBoxBg: 'bg-rose-50/70 border-rose-200/80 text-slate-800',
    dateCardBg: 'bg-white text-slate-700 hover:bg-rose-100/60 border-rose-200/80 shadow-2xs',
    dateCardActive: 'bg-rose-500 text-white border-rose-500 shadow-md scale-[1.02]',
    badgeBg: 'bg-rose-500 text-white shadow-md',
    buttonPrimary: 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg',
    secretBoxBg: 'border-amber-400/40 bg-amber-500/10 text-amber-700',
    inputBg: 'bg-white border-rose-200 text-slate-800 placeholder-slate-400 focus:ring-rose-400',
    tapeColor: 'bg-rose-200/70',
    polaroidInnerBg: 'bg-gradient-to-br from-rose-100/80 to-purple-100/80',
    glassBg: 'bg-white/80 border-pink-100/80',
    sectionGlow: 'shadow-[0_18px_45px_rgba(244,114,182,0.12)]',
    decorativeIcon: '💌',
  },
  'lavender-night': {
    id: 'lavender-night',
    name: 'Lavender Night',
    description: 'Midnight secret letter',
    gradient: 'from-[#120f24] via-[#1e153b] to-[#120f24]',
    accent: '#b794f6',
    isDark: true,
    typography: {
      display: '"Cormorant Garamond", Georgia, serif',
      heading: '"Cormorant Garamond", Georgia, serif',
      body: '"Lora", Georgia, serif',
      script: '"Dancing Script", cursive',
      button: '"Poppins", sans-serif',
      metadata: '"Poppins", sans-serif',
    },
    paperTexture: 'bg-[#1e1438]/95 shadow-purple-950/80',
    sealStyle: 'bg-purple-500/20 shadow-purple-900/50',
    cardStyle: 'rounded-3xl',
    canvasBg: 'bg-gradient-to-b from-[#120f24] via-[#1e153b] to-[#120f24] text-[#f5edff] border-purple-500/30',
    unopenedBg: 'from-[#120f24] via-[#1e153b] to-[#120f24]',
    openedBg: 'from-[#120f24] via-[#1e153b] to-[#120f24]',
    envBox: 'bg-gradient-to-b from-[#2b1c4a] via-[#23163e] to-[#1c1133] border-purple-400/40 shadow-[0_25px_60px_-15px_rgba(139,92,246,0.35)]',
    envFlapFill: '#35235a',
    envTitleColor: 'text-[#ffffff]',
    envSubColor: 'text-[#c084fc]',
    envTapColor: 'text-[#c084fc]',
    titleColor: 'text-[#ffffff]',
    textColor: 'text-[#f5edff]',
    subColor: 'text-[#c084fc]',
    cardBg: 'bg-[#1e1438]/95 text-[#f5edff] border-purple-400/30 shadow-purple-950/80',
    jokeCardBg: 'bg-[#23163e]/95 text-[#f5edff] border-purple-400/30 shadow-sm',
    inviteBg: 'bg-purple-950/60 text-white border-purple-400/30 shadow-2xl',
    dateBoxBg: 'bg-purple-950/80 border-purple-400/30 text-white',
    dateCardBg: 'bg-white/5 text-purple-100 hover:bg-white/10 border-purple-400/20 shadow-2xs',
    dateCardActive: 'bg-purple-600 text-white border-purple-500 shadow-md scale-[1.02]',
    badgeBg: 'bg-purple-600 text-white shadow-md',
    buttonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg',
    secretBoxBg: 'border-purple-400/40 bg-purple-500/15 text-purple-200',
    inputBg: 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-purple-400',
    tapeColor: 'bg-purple-300/60',
    polaroidInnerBg: 'bg-gradient-to-br from-purple-900/60 to-indigo-900/60',
    glassBg: 'bg-purple-950/60 border-purple-400/30 text-white',
    sectionGlow: 'shadow-[0_18px_45px_rgba(168,85,247,0.16)]',
    decorativeIcon: '🌙',
  },
  'sunset-love': {
    id: 'sunset-love',
    name: 'Sunset Love',
    description: 'Warm handwritten memories',
    gradient: 'from-[#fff7ed] via-[#fee7d6] to-[#fdd5c4]',
    accent: '#f97316',
    isDark: false,
    typography: {
      display: '"Italiana", Georgia, serif',
      heading: '"Italiana", Georgia, serif',
      body: '"Lora", Georgia, serif',
      script: '"Alex Brush", cursive',
      button: '"Poppins", sans-serif',
      metadata: '"Poppins", sans-serif',
    },
    paperTexture: 'bg-[#fffdfa] shadow-[0_20px_50px_rgba(251,146,60,0.15)]',
    sealStyle: 'bg-orange-500/20 shadow-orange-300/50',
    cardStyle: 'rounded-3xl',
    canvasBg: 'bg-gradient-to-br from-[#fff7ed] via-[#fee7d6] to-[#fdd5c4] text-[#451e11] border-orange-200/80',
    unopenedBg: 'from-[#fff7ed] via-[#fee7d6] to-[#fdd5c4]',
    openedBg: 'from-[#fff7ed] via-[#fee7d6] to-[#fdd5c4]',
    envBox: 'bg-gradient-to-b from-[#fff1e6] via-[#fde3d2] to-[#fad3be] border-white shadow-[0_25px_60px_-15px_rgba(255,154,118,0.4)]',
    envFlapFill: '#fde7d8',
    envTitleColor: 'text-[#451e11]',
    envSubColor: 'text-[#f97316]',
    envTapColor: 'text-[#f97316]',
    titleColor: 'text-[#451e11]',
    textColor: 'text-[#2d130a]',
    subColor: 'text-[#f97316]',
    cardBg: 'bg-[#fffdfa] text-[#2d130a] border-orange-200 shadow-[0_20px_50px_rgba(251,146,60,0.15)]',
    jokeCardBg: 'bg-[#fffbf8] text-[#2d130a] border-orange-200 shadow-sm',
    inviteBg: 'bg-white/85 text-[#451e11] border-orange-200 shadow-2xl',
    dateBoxBg: 'bg-orange-50/80 border-orange-200 text-[#2d130a]',
    dateCardBg: 'bg-white text-stone-700 hover:bg-orange-100/60 border-orange-200 shadow-2xs',
    dateCardActive: 'bg-orange-500 text-white border-orange-500 shadow-md scale-[1.02]',
    badgeBg: 'bg-orange-500 text-white shadow-md',
    buttonPrimary: 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg',
    secretBoxBg: 'border-amber-400/40 bg-amber-500/10 text-amber-700',
    inputBg: 'bg-white border-orange-200 text-stone-800 placeholder-stone-400 focus:ring-orange-400',
    tapeColor: 'bg-orange-200/70',
    polaroidInnerBg: 'bg-gradient-to-br from-amber-100/80 to-orange-100/80',
    glassBg: 'bg-white/85 border-orange-200/80',
    sectionGlow: 'shadow-[0_18px_45px_rgba(249,115,22,0.12)]',
    decorativeIcon: '🌅',
  },
  'minimal-cream': {
    id: 'minimal-cream',
    name: 'Minimal Cream',
    description: 'Elegant luxury stationery',
    gradient: 'from-[#fbfaf7] via-[#f5f0e6] to-[#ebe3d5]',
    accent: '#b48c4a',
    isDark: false,
    typography: {
      display: '"Cormorant Garamond", Georgia, serif',
      heading: '"Cormorant Garamond", Georgia, serif',
      body: '"Lora", Georgia, serif',
      script: '"Great Vibes", cursive',
      button: '"Poppins", sans-serif',
      metadata: '"Poppins", sans-serif',
    },
    paperTexture: 'bg-[#fcfbf9] shadow-amber-900/10',
    sealStyle: 'bg-amber-500/20 shadow-amber-900/20',
    cardStyle: 'rounded-3xl',
    canvasBg: 'bg-gradient-to-br from-[#fbfaf7] via-[#f5f0e6] to-[#ebe3d5] text-[#30261c] border-amber-200/60',
    unopenedBg: 'from-[#fbfaf7] via-[#f5f0e6] to-[#ebe3d5]',
    openedBg: 'from-[#fbfaf7] via-[#f5f0e6] to-[#ebe3d5]',
    envBox: 'bg-gradient-to-b from-[#f8f5ee] via-[#efe8dc] to-[#e4dac8] border-[#e2d5c0] shadow-[0_25px_60px_-15px_rgba(180,160,130,0.35)]',
    envFlapFill: '#f3ecde',
    envTitleColor: 'text-[#30261c]',
    envSubColor: 'text-[#b48c4a]',
    envTapColor: 'text-[#b48c4a]',
    titleColor: 'text-[#30261c]',
    textColor: 'text-[#201912]',
    subColor: 'text-[#b48c4a]',
    cardBg: 'bg-[#fcfbf9] text-[#201912] border-[#e8ded0] shadow-amber-900/10',
    jokeCardBg: 'bg-[#f8f5ee] text-[#201912] border-[#e8ded0] shadow-sm',
    inviteBg: 'bg-white/90 text-[#30261c] border-amber-200 shadow-2xl',
    dateBoxBg: 'bg-amber-50/70 border-amber-200 text-[#201912]',
    dateCardBg: 'bg-white text-stone-700 hover:bg-amber-100/60 border-amber-200 shadow-2xs',
    dateCardActive: 'bg-amber-600 text-white border-amber-600 shadow-md scale-[1.02]',
    badgeBg: 'bg-amber-600 text-white shadow-md',
    buttonPrimary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg',
    secretBoxBg: 'border-amber-400/40 bg-amber-500/10 text-amber-800',
    inputBg: 'bg-white border-amber-200 text-stone-800 placeholder-stone-400 focus:ring-amber-500',
    tapeColor: 'bg-amber-200/70',
    polaroidInnerBg: 'bg-gradient-to-br from-amber-100/80 to-stone-200/80',
    glassBg: 'bg-white/90 border-amber-200/60',
    sectionGlow: 'shadow-[0_10px_25px_rgba(180,140,74,0.06)]',
    decorativeIcon: '✨',
  },
  'starry-romance': {
    id: 'starry-romance',
    name: 'Starry Romance',
    description: 'Cinematic night love story',
    gradient: 'from-[#060a12] via-[#0d1527] to-[#060a12]',
    accent: '#60a5fa',
    isDark: true,
    typography: {
      display: '"Playfair Display", Georgia, serif',
      heading: '"Playfair Display", Georgia, serif',
      body: '"Cormorant Garamond", Georgia, serif',
      script: '"Dancing Script", cursive',
      button: '"Poppins", sans-serif',
      metadata: '"Poppins", sans-serif',
    },
    paperTexture: 'bg-[#0e162a]/95 shadow-blue-950/80',
    sealStyle: 'bg-blue-500/20 shadow-blue-900/50',
    cardStyle: 'rounded-3xl',
    canvasBg: 'bg-gradient-to-b from-[#060a12] via-[#0d1527] to-[#060a12] text-[#eef4ff] border-blue-500/30',
    unopenedBg: 'from-[#060a12] via-[#0d1527] to-[#060a12]',
    openedBg: 'from-[#060a12] via-[#0d1527] to-[#060a12]',
    envBox: 'bg-gradient-to-b from-[#131e38] via-[#0f182e] to-[#0a1122] border-blue-400/40 shadow-[0_25px_60px_-15px_rgba(59,130,246,0.35)]',
    envFlapFill: '#182647',
    envTitleColor: 'text-[#ffffff]',
    envSubColor: 'text-[#60a5fa]',
    envTapColor: 'text-[#60a5fa]',
    titleColor: 'text-[#ffffff]',
    textColor: 'text-[#eef4ff]',
    subColor: 'text-[#60a5fa]',
    cardBg: 'bg-[#0e162a]/95 text-[#eef4ff] border-blue-400/30 shadow-blue-950/80',
    jokeCardBg: 'bg-[#111c34]/95 text-[#eef4ff] border-blue-400/30 shadow-sm',
    inviteBg: 'bg-[#0f172a]/85 text-white border-blue-400/30 shadow-2xl',
    dateBoxBg: 'bg-blue-950/80 border-blue-400/30 text-white',
    dateCardBg: 'bg-white/5 text-blue-100 hover:bg-white/10 border-blue-400/20 shadow-2xs',
    dateCardActive: 'bg-blue-600 text-white border-blue-500 shadow-md scale-[1.02]',
    badgeBg: 'bg-blue-600 text-white shadow-md',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg',
    secretBoxBg: 'border-blue-400/40 bg-blue-500/15 text-blue-200',
    inputBg: 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-blue-400',
    tapeColor: 'bg-blue-300/60',
    polaroidInnerBg: 'bg-gradient-to-br from-blue-950/80 to-slate-900/80',
    glassBg: 'bg-[#0f172a]/80 border-blue-400/30 text-white',
    sectionGlow: 'shadow-[0_18px_45px_rgba(96,165,250,0.15)]',
    decorativeIcon: '🌌',
  },
};
