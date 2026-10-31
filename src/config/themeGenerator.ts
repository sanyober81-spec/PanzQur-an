import { APP_CONFIG } from './appConfig';

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 18;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 107;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 80;
  return { r, g, b };
}

// Helper to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 + percent / 100;
  const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)));
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

export interface GeneratedBrandTheme {
  appName: string;
  tagline: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySoft: string;
  cream: string;
  creamSoft: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  goldAccent: string;
  iconPath: string;
}

export function generateBrandTheme(): GeneratedBrandTheme {
  const primary = APP_CONFIG.primaryColor || '#126B50';
  const primaryDark = adjustColorBrightness(primary, -28);
  const primaryLight = adjustColorBrightness(primary, 24);
  const primarySoft = adjustColorBrightness(primary, 130);

  // Generate an authentic, serene tagline based on the appName
  const tagline = "Temani Tilawah, Dekatkan Makna.";

  return {
    appName: APP_CONFIG.appName || 'eQuran',
    tagline,
    primary,
    primaryDark,
    primaryLight,
    primarySoft,
    cream: '#F5F0D9',
    creamSoft: '#FCFAF2',
    background: '#FAF9F4',
    surface: '#FFFFFF',
    textPrimary: '#24352B',
    textSecondary: '#576B60',
    textMuted: '#84968C',
    border: '#E5E1D5',
    goldAccent: '#B89B58',
    iconPath: '/assets/aistudio/PanzQur_an__2__d8c2134f.png',
  };
}

/**
 * Injects dynamic CSS variables and updates document metadata based on APP_CONFIG
 */
export function applyThemeTokens(): GeneratedBrandTheme {
  const theme = generateBrandTheme();

  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-dark', theme.primaryDark);
    root.style.setProperty('--color-primary-light', theme.primaryLight);
    root.style.setProperty('--color-cream', theme.cream);
    root.style.setProperty('--color-cream-soft', theme.creamSoft);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--color-text-primary', theme.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.textSecondary);
    root.style.setProperty('--color-text-muted', theme.textMuted);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-gold-accent', theme.goldAccent);

    // Update document title and theme-color meta tag
    document.title = `${theme.appName} Digital — ${theme.tagline}`;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.primary);
    }
  }

  return theme;
}
