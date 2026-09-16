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

export const THEME_CONFIG: Record<ExperienceTheme, { name: string; gradient: string; accent: string }> = {
  'pink-dream': { name: 'Pink Dream', gradient: 'from-[#fff1f5] via-[#ffe0ec] to-[#ffd6e7]', accent: '#e85d8d' },
  'lavender-night': { name: 'Lavender Night', gradient: 'from-[#1a1a2e] via-[#2d1b4e] to-[#1a1a2e]', accent: '#b794f6' },
  'sunset-love': { name: 'Sunset Love', gradient: 'from-[#fff5e6] via-[#ffd9c0] to-[#ffb3a7]', accent: '#ff6b6b' },
  'minimal-cream': { name: 'Minimal Cream', gradient: 'from-[#fdfcfa] via-[#f8f4f0] to-[#f2ebe5]', accent: '#c9a96e' },
  'starry-romance': { name: 'Starry Romance', gradient: 'from-[#0d1117] via-[#161b2e] to-[#0d1117]', accent: '#7eb6ff' },
};
