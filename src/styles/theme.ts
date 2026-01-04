// テーマとデザインシステム - Instagram風のクールなデザイン
export const theme = {
  colors: {
    primary: '#000000',
    secondary: '#1a1a1a',
    accent: '#0095f6', // Instagramっぽいブルー
    background: '#fafafa', // より明るいグレー
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    text: {
      primary: '#262626', // より深い黒
      secondary: '#8e8e8e', // Instagramっぽいグレー
      tertiary: '#c7c7c7',
      inverse: '#ffffff',
      link: '#0095f6',
    },
    border: '#dbdbdb', // Instagramっぽい境界色
    borderLight: '#efefef',
    shadow: '#000000',
    success: '#00d4aa',
    warning: '#ffcd3c',
    error: '#ed4956',
  },
  
  fonts: {
    // Primary fonts - クールでモダンなデザインに
    primary: 'Poppins_400Regular',
    primaryMedium: 'Poppins_500Medium',
    primarySemiBold: 'Poppins_600SemiBold',
    primaryBold: 'Poppins_700Bold',
    
    // Secondary fonts - 読みやすさを重視
    secondary: 'DMSans_400Regular',
    secondaryMedium: 'DMSans_500Medium',
    secondarySemiBold: 'DMSans_600SemiBold',
    secondaryBold: 'DMSans_700Bold',
    
    // Accent fonts - インパクトのあるタイトルなど
    accent: 'Oswald_400Regular',
    accentMedium: 'Oswald_500Medium',
    accentSemiBold: 'Oswald_600SemiBold',
    accentBold: 'Oswald_700Bold',
    
    // Condensed fonts - 補助的な使用
    condensed: 'RobotoCondensed_400Regular',
    condensedBold: 'RobotoCondensed_700Bold',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 3,    // より角ばった小さな角丸
    md: 6,    // より角ばった中程度の角丸
    lg: 8,    // より角ばった大きな角丸
    xl: 12,   // より角ばった特大の角丸
    none: 0,  // 完全に角ばったデザイン用
    button: 4, // ボタン専用の角丸
    card: 8,   // カード専用の角丸
  },
  
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    minimal: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export const typography = {
  brand: {
    fontFamily: theme.fonts.accentBold,
    fontSize: 40,
    lineHeight: 48,
    color: theme.colors.accent, // ブランドカラー（青）に統一
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  h1: {
    fontFamily: theme.fonts.accentBold,
    fontSize: 32,
    lineHeight: 36,
    color: theme.colors.text.primary,
    letterSpacing: -0.8,
    textTransform: 'uppercase' as const,
  },
  h2: {
    fontFamily: theme.fonts.primarySemiBold,
    fontSize: 24,
    lineHeight: 28,
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
  },
  h3: {
    fontFamily: theme.fonts.primaryMedium,
    fontSize: 20,
    lineHeight: 24,
    color: theme.colors.text.primary,
    letterSpacing: -0.2,
  },
  body1: {
    fontFamily: theme.fonts.secondary,
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.text.primary,
  },
  body2: {
    fontFamily: theme.fonts.secondary,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text.secondary,
  },
  caption: {
    fontFamily: theme.fonts.secondary,
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.text.tertiary,
  },
  button: {
    fontFamily: theme.fonts.primarySemiBold,
    fontSize: 14,
    lineHeight: 16,
    color: theme.colors.text.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  buttonLarge: {
    fontFamily: theme.fonts.primarySemiBold,
    fontSize: 16,
    lineHeight: 18,
    color: theme.colors.text.primary,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
  label: {
    fontFamily: theme.fonts.secondaryMedium,
    fontSize: 14,
    lineHeight: 18,
    color: theme.colors.text.primary,
    letterSpacing: 0.1,
  },
  accent: {
    fontFamily: theme.fonts.accentMedium,
    fontSize: 18,
    lineHeight: 20,
    color: theme.colors.text.primary,
    letterSpacing: 0.2,
    textTransform: 'uppercase' as const,
  },
};
