export type ExperienceTheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;

  text: string;
  textSecondary: string;
  textMuted: string;

  accent: string;
  accentHover: string;
  accentSoft: string;

  border: string;
  borderStrong: string;

  success: string;
  warning: string;
  danger: string;
}

export interface ThemeTypography {
  display: string;
  heading: string;
  body: string;
  script: string;
  button: string;
  metadata: string;
  // Font family names
  titleFont: string;
  headingFont: string;
  bodyFont: string;
  scriptFont: string;
  uiFont: string;
}

export interface ThemeEnvelope {
  body: string;
  flap: string;
  seal: string;
  border: string;
  shadow: string;
  title: string;
  subtitle: string;
  tapText: string;
}

export interface ThemeLetter {
  background: string;
  border: string;
  shadow: string;
  text: string;
  heading: string;
}

export interface ThemeCards {
  background: string;
  border: string;
  shadow: string;
  hover: string;
}

export interface ThemeGallery {
  background: string;
  border: string;
  overlay: string;
}

export interface ThemeButtons {
  primary: string;
  secondary: string;
  ghost: string;
}

export interface ThemeDecorations {
  hearts: string;
  flowers: string;
  particles: string;
  glow: string;
}

export interface ThemeEffects {
  shadow: string;
  glow: string;
  blur: string;
  texture: string;
}

export interface ThemeAnimations {
  envelopeOpen: string;
  reveal: string;
  floating: string;
  hover: string;
}

export interface ThemeSpacing {
  section: string;
  card: string;
}

export interface ThemeRadius {
  card: string;
  button: string;
  badge: string;
}

export interface ThemeConfig {
  id: ExperienceTheme;
  name: string;
  mode: 'light' | 'dark';
  description: string;

  colors: ThemeColors;
  typography: ThemeTypography;
  envelope: ThemeEnvelope;
  letter: ThemeLetter;
  cards: ThemeCards;
  gallery: ThemeGallery;
  buttons: ThemeButtons;
  decorations: ThemeDecorations;
  effects: ThemeEffects;
  animations: ThemeAnimations;
  spacing: ThemeSpacing;
  radius: ThemeRadius;

  // High-level Tailwind shortcuts for direct component usage
  canvasBg: string;
  unopenedBg: string;
  openedBg: string;
  gradient: string;
  accent: string;
  isDark: boolean;
  titleColor: string;
  subColor: string;
  textColor: string;
  cardBg: string;
  jokeCardBg: string;
  inviteBg: string;
  dateBoxBg: string;
  dateCardBg: string;
  dateCardActive: string;
  badgeBg: string;
  buttonPrimary: string;
  secretBoxBg: string;
  secretToggleBg?: string;
  inputBg: string;
  tapeColor: string;
  polaroidInnerBg: string;
  polaroidCaptionColor?: string;
  envBox: string;
  envFlapFill: string;
  envTitleColor: string;
  envSubColor: string;
  envTapColor: string;
  sealStyle: string;
  paperTexture: string;
  cardStyle: string;
  glassBg: string;
}

/**
 * Safely maps any database theme (including legacy themes) to 'light' or 'dark'.
 * Guaranteed to never crash or break existing experiences.
 */
export function normalizeTheme(theme: string | null | undefined): ExperienceTheme {
  if (!theme) return 'light';
  const clean = theme.toLowerCase().trim();
  if (clean === 'dark' || clean === 'lavender-night' || clean === 'starry-romance') {
    return 'dark';
  }
  return 'light';
}
