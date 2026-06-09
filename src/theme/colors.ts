// Theme color constants based on modern HSL palettes

export interface ThemeColors {
  isDark: boolean;
  background: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string; // Neon Cyan or Royal Blue
  secondary: string; // Neon Purple or Teal
  accent: string; // Coral or Gold
  success: string;
  warning: string;
  danger: string;
  tabBarBg: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const darkTheme: ThemeColors = {
  isDark: true,
  background: '#060814', // Deep Space Black/Indigo
  cardBg: 'rgba(16, 20, 38, 0.65)', // Glassmorphic translucent dark
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#FFFFFF',
  textSecondary: '#E2E8F0', // Soft Silver
  textMuted: '#94A3B8', // Slate Gray
  primary: '#00F2FE', // Neon Cyan
  secondary: '#9B51E0', // Neon Purple
  accent: '#FF6B6B', // Coral
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  danger: '#EF4444', // Red
  tabBarBg: 'rgba(10, 12, 30, 0.9)',
  tabBarBorder: 'rgba(255, 255, 255, 0.06)',
  tabBarActive: '#00F2FE',
  tabBarInactive: '#64748B',
};

export const lightTheme: ThemeColors = {
  isDark: false,
  background: '#F4F7FA', // Soft ice blue nebula
  cardBg: 'rgba(255, 255, 255, 0.8)', // Glassmorphic translucent white
  cardBorder: 'rgba(30, 58, 138, 0.06)',
  textPrimary: '#1E293B', // Charcoal Slate
  textSecondary: '#475569',
  textMuted: '#64748B',
  primary: '#1E3A8A', // Deep Royal Blue
  secondary: '#0D9488', // Teal
  accent: '#D97706', // Gold / Amber
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  tabBarBg: 'rgba(255, 255, 255, 0.92)',
  tabBarBorder: 'rgba(30, 58, 138, 0.05)',
  tabBarActive: '#1E3A8A',
  tabBarInactive: '#94A3B8',
};
