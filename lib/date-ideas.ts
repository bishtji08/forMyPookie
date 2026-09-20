export interface DateIdea {
  key: string;
  label: string;
  emoji: string;
  category: 'food' | 'outdoor' | 'romantic' | 'fun';
  description: string;
}

export const DATE_CATEGORIES: Record<string, { label: string; emoji: string }> = {
  romantic: { label: 'Romantic', emoji: '✨' },
  food: { label: 'Food', emoji: '🍰' },
  outdoor: { label: 'Outdoors & Trips', emoji: '🌿' },
  fun: { label: 'Playful & Fun', emoji: '🎮' },
};

export const PRESET_DATE_IDEAS: DateIdea[] = [
  // Romantic
  { key: 'movie', label: 'Movie', emoji: '🍿', category: 'romantic', description: 'Watch a movie together and chill.' },

  // Food & Drinks
  { key: 'coffee', label: 'Coffee', emoji: '☕', category: 'food', description: 'A cute corner café, warm cups, and deep talks.' },


  // Outdoors & Trips
  { key: 'walk', label: 'Walk', emoji: '🚶', category: 'outdoor', description: 'Holding hands, night breeze, and talking about life.' },
  { key: 'temple', label: 'Temple', emoji: '⛩️', category: 'outdoor', description: 'Visit temple and pray for our love and future.' },

  // Playful & Fun
  { key: 'arcade', label: 'Arcade', emoji: '🎳', category: 'fun', description: 'Winning tickets, arcade basketball, and lots of laughs.' },
];

export const DEFAULT_DATE_KEYS = [
  'coffee',
  'movie',
  'walk',
  'trip',
  'surprise',
  'ice-cream'
];

/**
 * Returns formatted label and emoji for any date option key,
 * whether it is a preset or a custom user-defined string.
 */
export function formatCustomDateIdea(keyOrText: string): { label: string; emoji: string } {
  const found = PRESET_DATE_IDEAS.find((p) => p.key === keyOrText);
  if (found) {
    return { label: found.label, emoji: found.emoji };
  }

  // Check if string already starts with an emoji
  const trimmed = keyOrText.trim();
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;
  const match = trimmed.match(emojiRegex);
  if (match) {
    const emoji = match[0];
    const label = trimmed.replace(emojiRegex, '').trim();
    return { label: label || trimmed, emoji };
  }

  // Default romantic sparkle emoji for custom date ideas
  return {
    label: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
    emoji: '💌',
  };
}
