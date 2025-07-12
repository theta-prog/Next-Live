import { theme, typography } from '../../styles/theme';

describe('Theme and Typography', () => {
  describe('Theme Configuration', () => {
    it('has correct primary colors', () => {
      expect(theme.colors.primary).toBe('#000000');
      expect(theme.colors.secondary).toBe('#1a1a1a');
      expect(theme.colors.accent).toBe('#0095f6');
      expect(theme.colors.background).toBe('#fafafa');
      expect(theme.colors.surface).toBe('#ffffff');
    });

    it('has correct text colors', () => {
      expect(theme.colors.text.primary).toBe('#262626');
      expect(theme.colors.text.secondary).toBe('#8e8e8e');
      expect(theme.colors.text.tertiary).toBe('#c7c7c7');
      expect(theme.colors.text.inverse).toBe('#ffffff');
      expect(theme.colors.text.link).toBe('#0095f6');
    });

    it('has correct spacing values', () => {
      expect(theme.spacing.xs).toBe(4);
      expect(theme.spacing.sm).toBe(8);
      expect(theme.spacing.md).toBe(16);
      expect(theme.spacing.lg).toBe(24);
      expect(theme.spacing.xl).toBe(32);
      expect(theme.spacing.xxl).toBe(48);
    });

    it('has correct border radius values', () => {
      expect(theme.borderRadius.sm).toBe(3);
      expect(theme.borderRadius.md).toBe(6);
      expect(theme.borderRadius.lg).toBe(8);
      expect(theme.borderRadius.xl).toBe(12);
      expect(theme.borderRadius.none).toBe(0);
      expect(theme.borderRadius.button).toBe(4);
      expect(theme.borderRadius.card).toBe(8);
    });

    it('has correct shadow configuration', () => {
      expect(theme.shadows.small).toBeDefined();
      expect(theme.shadows.medium).toBeDefined();
      expect(theme.shadows.large).toBeDefined();
      expect(theme.shadows.none.shadowOpacity).toBe(0);
      expect(theme.shadows.small.shadowOpacity).toBe(0.08);
    });

    it('has correct font families', () => {
      expect(theme.fonts.primary).toBe('Poppins_400Regular');
      expect(theme.fonts.primaryBold).toBe('Poppins_700Bold');
      expect(theme.fonts.secondary).toBe('DMSans_400Regular');
      expect(theme.fonts.accent).toBe('Oswald_400Regular');
      expect(theme.fonts.condensed).toBe('RobotoCondensed_400Regular');
    });

    it('has semantic colors', () => {
      expect(theme.colors.success).toBe('#00d4aa');
      expect(theme.colors.warning).toBe('#ffcd3c');
      expect(theme.colors.error).toBe('#ed4956');
      expect(theme.colors.border).toBe('#dbdbdb');
    });
  });

  describe('Typography Configuration', () => {
    it('has heading styles', () => {
      expect(typography.h1).toBeDefined();
      expect(typography.h2).toBeDefined();
      expect(typography.h3).toBeDefined();
      expect(typography.h1.fontSize).toBeGreaterThan(typography.h2.fontSize);
      expect(typography.h2.fontSize).toBeGreaterThan(typography.h3.fontSize);
    });

    it('has body text styles', () => {
      expect(typography.body1).toBeDefined();
      expect(typography.body2).toBeDefined();
      expect(typography.button).toBeDefined();
      expect(typography.buttonLarge).toBeDefined();
    });

    it('has caption and label styles', () => {
      expect(typography.caption).toBeDefined();
      expect(typography.label).toBeDefined();
      expect(typography.accent).toBeDefined();
    });

    it('has correct font families in typography', () => {
      expect(typography.h1.fontFamily).toBe('Oswald_700Bold');
      expect(typography.body1.fontFamily).toBe('DMSans_400Regular');
      expect(typography.caption.fontFamily).toBe('DMSans_400Regular');
    });

    it('has consistent line heights', () => {
      expect(typography.h1.lineHeight).toBeGreaterThan(0);
      expect(typography.body1.lineHeight).toBeGreaterThan(0);
      expect(typography.caption.lineHeight).toBeGreaterThan(0);
    });
  });

  describe('Theme Consistency', () => {
    it('maintains consistent color naming', () => {
      const colorKeys = Object.keys(theme.colors);
      expect(colorKeys.includes('primary')).toBe(true);
      expect(colorKeys.includes('secondary')).toBe(true);
      expect(colorKeys.includes('background')).toBe(true);
      expect(colorKeys.includes('text')).toBe(true);
    });

    it('maintains consistent spacing scale', () => {
      const spacingValues = Object.values(theme.spacing);
      const sortedSpacing = [...spacingValues].sort((a, b) => a - b);
      expect(spacingValues).toEqual(sortedSpacing);
    });

    it('maintains consistent border radius scale', () => {
      const { none, button, card, ...radiusValues } = theme.borderRadius;
      const values = Object.values(radiusValues);
      const sortedValues = [...values].sort((a, b) => a - b);
      expect(values).toEqual(sortedValues);
    });

    it('has consistent font weight progression', () => {
      expect(theme.fonts.primary).toContain('400');
      expect(theme.fonts.primaryMedium).toContain('500');
      expect(theme.fonts.primarySemiBold).toContain('600');
      expect(theme.fonts.primaryBold).toContain('700');
    });

    it('has accessible color contrast', () => {
      // Test that text colors are different from background colors
      expect(theme.colors.text.primary).not.toBe(theme.colors.background);
      expect(theme.colors.text.primary).not.toBe(theme.colors.surface);
      expect(theme.colors.text.inverse).not.toBe(theme.colors.primary);
    });
  });
});
