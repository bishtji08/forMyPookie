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

export interface ThemeStyleConfig {
  name: string;
  gradient: string;
  accent: string;
  isDark: boolean;
  unopenedBg: string;
  envBox: string;
  envFlapFill: string;
  envTitleColor: string;
  envSubColor: string;
  envTapColor: string;
  openedBg: string;
  titleColor: string;
  textColor: string;
  subColor: string;
  cardBg: string;
  glassBg: string;
}

export const THEME_CONFIG: Record<ExperienceTheme, ThemeStyleConfig> = {
  'pink-dream': {
    name: 'Pink Dream',
    gradient: 'from-[#fbf2fc] via-[#faebf7] to-[#fff5ea]',
    accent: '#e85d8d',
    isDark: false,
    unopenedBg: 'from-[#fbf2fc] via-[#faebf7] to-[#fff5ea]',
    envBox: 'bg-gradient-to-b from-[#fbf2fc] via-[#f7eaf8] to-[#f3e3f5] border-white shadow-[0_25px_60px_-15px_rgba(225,175,215,0.55)]',
    envFlapFill: '#faedf9',
    envTitleColor: 'text-[#3f1d2e]',
    envSubColor: 'text-[#916b7f]',
    envTapColor: 'text-[#d4789b]',
    openedBg: 'from-[#fdf5fd] via-[#fbf0fa] to-[#fff7ee]',
    titleColor: 'text-[#3f1d2e]',
    textColor: 'text-[#2b101e]',
    subColor: 'text-[#8f6479]',
    cardBg: 'bg-[#fffefb] text-[#2b101e] border-[#f2d9e6] shadow-rose-200/40',
    glassBg: 'bg-white/80 border-pink-100/80',
  },
  'lavender-night': {
    name: 'Lavender Night',
    gradient: 'from-[#120f24] via-[#1e153b] to-[#120f24]',
    accent: '#b794f6',
    isDark: true,
    unopenedBg: 'from-[#100d20] via-[#1b1435] to-[#100d20]',
    envBox: 'bg-gradient-to-b from-[#2b1c4a] via-[#23163e] to-[#1c1133] border-purple-400/40 shadow-[0_25px_60px_-15px_rgba(139,92,246,0.35)]',
    envFlapFill: '#35235a',
    envTitleColor: 'text-[#ffffff]',
    envSubColor: 'text-[#d8b4fe]',
    envTapColor: 'text-[#c084fc]',
    openedBg: 'from-[#120f24] via-[#1e153b] to-[#120f24]',
    titleColor: 'text-[#ffffff]',
    textColor: 'text-[#f5edff]',
    subColor: 'text-[#d8b4fe]',
    cardBg: 'bg-[#1e1438]/95 text-[#f5edff] border-purple-400/30 shadow-purple-950/80',
    glassBg: 'bg-purple-950/60 border-purple-400/30 text-white',
  },
  'sunset-love': {
    name: 'Sunset Love',
    gradient: 'from-[#fff7ed] via-[#fee7d6] to-[#fdd5c4]',
    accent: '#ff6b6b',
    isDark: false,
    unopenedBg: 'from-[#fff8f0] via-[#fee9dc] to-[#fde2db]',
    envBox: 'bg-gradient-to-b from-[#fff1e6] via-[#fde3d2] to-[#fad3be] border-white shadow-[0_25px_60px_-15px_rgba(255,154,118,0.4)]',
    envFlapFill: '#fde7d8',
    envTitleColor: 'text-[#451e11]',
    envSubColor: 'text-[#9e5c43]',
    envTapColor: 'text-[#f97316]',
    openedBg: 'from-[#fff8f2] via-[#feefe4] to-[#fde6d8]',
    titleColor: 'text-[#451e11]',
    textColor: 'text-[#2d130a]',
    subColor: 'text-[#9e5c43]',
    cardBg: 'bg-[#fffdfa] text-[#2d130a] border-orange-200/80 shadow-orange-200/40',
    glassBg: 'bg-white/85 border-orange-200/80',
  },
  'minimal-cream': {
    name: 'Minimal Cream',
    gradient: 'from-[#fbfaf7] via-[#f5f0e6] to-[#ebe3d5]',
    accent: '#c9a96e',
    isDark: false,
    unopenedBg: 'from-[#faf8f3] via-[#f4eee4] to-[#ede5d8]',
    envBox: 'bg-gradient-to-b from-[#f8f5ee] via-[#efe8dc] to-[#e4dac8] border-[#e2d5c0] shadow-[0_25px_60px_-15px_rgba(180,160,130,0.35)]',
    envFlapFill: '#f3ecde',
    envTitleColor: 'text-[#30261c]',
    envSubColor: 'text-[#82725e]',
    envTapColor: 'text-[#b48c4a]',
    openedBg: 'from-[#fcfbf9] via-[#f7f3eb] to-[#eee7da]',
    titleColor: 'text-[#30261c]',
    textColor: 'text-[#201912]',
    subColor: 'text-[#82725e]',
    cardBg: 'bg-[#fcfbf9] text-[#201912] border-[#e8ded0] shadow-amber-900/10',
    glassBg: 'bg-white/90 border-amber-200/60',
  },
  'starry-romance': {
    name: 'Starry Romance',
    gradient: 'from-[#060a12] via-[#0d1527] to-[#060a12]',
    accent: '#7eb6ff',
    isDark: true,
    unopenedBg: 'from-[#060911] via-[#0b1324] to-[#060911]',
    envBox: 'bg-gradient-to-b from-[#131e38] via-[#0f182e] to-[#0a1122] border-blue-400/40 shadow-[0_25px_60px_-15px_rgba(59,130,246,0.35)]',
    envFlapFill: '#182647',
    envTitleColor: 'text-[#ffffff]',
    envSubColor: 'text-[#93c5fd]',
    envTapColor: 'text-[#60a5fa]',
    openedBg: 'from-[#060a12] via-[#0d1527] to-[#060a12]',
    titleColor: 'text-[#ffffff]',
    textColor: 'text-[#eef4ff]',
    subColor: 'text-[#93c5fd]',
    cardBg: 'bg-[#0e162a]/95 text-[#eef4ff] border-blue-400/30 shadow-blue-950/80',
    glassBg: 'bg-[#0f172a]/80 border-blue-400/30 text-white',
  },
};
