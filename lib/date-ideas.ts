export interface DateIdea {
  key: string;
  label: string;
  emoji: string;
  category: 'food' | 'cozy' | 'outdoor' | 'romantic' | 'fun';
  description: string;
}

export const DATE_CATEGORIES: Record<string, { label: string; emoji: string }> = {
  romantic: { label: 'Romantic & Intimate', emoji: '✨' },
  food: { label: 'Food & Drinks', emoji: '🍰' },
  cozy: { label: 'Cozy & Indoor', emoji: '🛋️' },
  outdoor: { label: 'Outdoors & Trips', emoji: '🌿' },
  fun: { label: 'Playful & Fun', emoji: '🎮' },
};

export const PRESET_DATE_IDEAS: DateIdea[] = [
  // Romantic & Intimate
  { key: 'stargazing', label: 'Stargazing Night', emoji: '🌌', category: 'romantic', description: 'Blankets, quiet sky, and us under the stars.' },
  { key: 'sunset', label: 'Sunset Watching', emoji: '🌅', category: 'romantic', description: 'Watching golden hour fade into night together.' },
  { key: 'rooftop', label: 'Rooftop Dinner', emoji: '🥂', category: 'romantic', description: 'City lights, quiet breeze, and our favorite food.' },
  { key: 'candlelight', label: 'Candlelight Dinner', emoji: '🕯️', category: 'romantic', description: 'Soft music, good food, and zero distractions.' },
  { key: 'surprise', label: 'Surprise Mystery Date', emoji: '✨', category: 'romantic', description: 'I plan everything. You just show up looking pretty.' },

  // Food & Drinks
  { key: 'coffee', label: 'Coffee & Croissants', emoji: '☕', category: 'food', description: 'A cute corner café, warm cups, and deep talks.' },
  { key: 'dinner', label: 'Fancy Dinner Date', emoji: '🍽️', category: 'food', description: 'Dressing up, good food, and dessert afterward.' },
  { key: 'ice-cream', label: 'Late-Night Ice Cream Run', emoji: '🍦', category: 'food', description: 'Driving for ice cream at 11 PM in sweatpants.' },
  { key: 'cooking', label: 'Cooking Together', emoji: '🍝', category: 'food', description: 'Messy kitchen, homemade pasta, and lots of laughs.' },
  { key: 'baking', label: 'Baking Sweet Treats', emoji: '🧁', category: 'food', description: 'Cupcakes or cookies with powdered sugar everywhere.' },
  { key: 'street-food', label: 'Street Food Crawl', emoji: '🥟', category: 'food', description: 'Trying every snack stall until we are full.' },

  // Cozy & Indoor
  { key: 'movie', label: 'Movie & Pillow Fort', emoji: '🎬', category: 'cozy', description: 'Popcorn, warm blankets, and our favorite comfort movies.' },
  { key: 'bookstore', label: 'Bookstore & Matcha', emoji: '📚', category: 'cozy', description: 'Browsing quiet aisles and picking books for each other.' },
  { key: 'spa', label: 'Spa & Pamper Day', emoji: '🧖‍♀️', category: 'cozy', description: 'Face masks, soothing music, massages, and total relaxation.' },
  { key: 'board-games', label: 'Board Games & Snacks', emoji: '🎲', category: 'cozy', description: 'Playful competition, funny arguments, and treats.' },

  // Outdoors & Trips
  { key: 'walk', label: 'Long Quiet Walk', emoji: '🌙', category: 'outdoor', description: 'Holding hands, night breeze, and talking about life.' },
  { key: 'drive', label: 'Late-Night Long Drive', emoji: '🚗', category: 'outdoor', description: 'Windows down, our favorite playlist, and open roads.' },
  { key: 'picnic', label: 'Park Picnic', emoji: '🧺', category: 'outdoor', description: 'Fruit, iced drinks, a soft blanket, and sunshine.' },
  { key: 'beach', label: 'Beach / Lake Day', emoji: '🌊', category: 'outdoor', description: 'Waves, walking barefoot on the sand, and sunset.' },

  // Playful & Fun
  { key: 'arcade', label: 'Arcade & Bowling', emoji: '🎳', category: 'fun', description: 'Winning tickets, arcade basketball, and lots of laughs.' },
  { key: 'pottery', label: 'Pottery / Paint Class', emoji: '🎨', category: 'fun', description: 'Getting our hands dirty and making something memorable.' },
  { key: 'amusement', label: 'Theme Park / Fair', emoji: '🎡', category: 'fun', description: 'Ferris wheel, cotton candy, and rollercoasters.' },
  { key: 'karaoke', label: 'Private Karaoke Night', emoji: '🎤', category: 'fun', description: 'Singing our favorite cheesy love songs at top volume.' },
];

export const DEFAULT_DATE_KEYS = [
  'coffee',
  'dinner',
  'movie',
  'walk',
  'drive',
  'surprise',
  'stargazing',
  'picnic',
  'ice-cream',
  'sunset',
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
