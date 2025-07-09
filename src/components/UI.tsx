import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, TextInput, TextInputProps } from 'react-native';
import { theme, typography } from '../styles/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  variant = 'default',
  noPadding = false 
}) => {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.cardElevated,
    variant === 'outlined' && styles.cardOutlined,
    noPadding && styles.cardNoPadding,
    style
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  style,
  textStyle,
  disabled = false,
}) => {
  const buttonStyle = [
    styles.button,
    size === 'small' && styles.buttonSmall,
    size === 'medium' && styles.buttonMedium,
    size === 'large' && styles.buttonLarge,
    variant === 'primary' && styles.buttonPrimary,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'outline' && styles.buttonOutline,
    variant === 'ghost' && styles.buttonGhost,
    fullWidth && styles.buttonFullWidth,
    disabled && styles.buttonDisabled,
    style,
  ];

  const buttonTextStyle = [
    size === 'small' && typography.button,
    size === 'medium' && typography.button,
    size === 'large' && typography.buttonLarge,
    variant === 'primary' && styles.buttonTextPrimary,
    variant === 'secondary' && styles.buttonTextSecondary,
    variant === 'outline' && styles.buttonTextOutline,
    variant === 'ghost' && styles.buttonTextGhost,
    disabled && styles.buttonTextDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  style?: TextStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  style 
}) => {
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={[typography.h2, styles.sectionHeader, style]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[typography.body2, styles.sectionSubtitle]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

interface IconButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  children,
  variant = 'ghost',
  size = 'medium',
  style,
  disabled = false,
}) => {
  const buttonStyle = [
    styles.iconButton,
    size === 'small' && styles.iconButtonSmall,
    size === 'medium' && styles.iconButtonMedium,
    size === 'large' && styles.iconButtonLarge,
    variant === 'primary' && styles.iconButtonPrimary,
    variant === 'secondary' && styles.iconButtonSecondary,
    variant === 'ghost' && styles.iconButtonGhost,
    disabled && styles.buttonDisabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  );
};

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.textInputContainer, containerStyle]}>
      {label && (
        <Text style={[typography.label, styles.textInputLabel]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.textInput,
          error && styles.textInputError,
          style,
        ]}
        placeholderTextColor={theme.colors.text.tertiary}
        {...props}
      />
      {error && (
        <Text style={[typography.caption, styles.textInputErrorText]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Card Styles
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    ...theme.shadows.small,
  },
  cardElevated: {
    ...theme.shadows.medium,
  },
  cardOutlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.none,
  },
  cardNoPadding: {
    padding: 0,
  },

  // Button Styles
  button: {
    borderRadius: theme.borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonSmall: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 36,
  },
  buttonMedium: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 44,
  },
  buttonLarge: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 52,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Button Text Styles
  buttonTextPrimary: {
    color: theme.colors.text.inverse,
  },
  buttonTextSecondary: {
    color: theme.colors.text.inverse,
  },
  buttonTextOutline: {
    color: theme.colors.text.primary,
  },
  buttonTextGhost: {
    color: theme.colors.text.link,
  },
  buttonTextDisabled: {
    opacity: 0.6,
  },

  // Section Header Styles
  sectionHeaderContainer: {
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    letterSpacing: -0.3,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    marginTop: theme.spacing.xs,
  },

  // Icon Button Styles
  iconButton: {
    borderRadius: theme.borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonSmall: {
    width: 32,
    height: 32,
  },
  iconButtonMedium: {
    width: 44,
    height: 44,
  },
  iconButtonLarge: {
    width: 52,
    height: 52,
  },
  iconButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  iconButtonSecondary: {
    backgroundColor: theme.colors.secondary,
  },
  iconButtonGhost: {
    backgroundColor: 'transparent',
  },

  // Text Input Styles
  textInputContainer: {
    marginBottom: theme.spacing.md,
  },
  textInputLabel: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.text.primary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.button,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    fontFamily: theme.fonts.secondary,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.surface,
    minHeight: 44,
  },
  textInputError: {
    borderColor: theme.colors.error,
  },
  textInputErrorText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.error,
  },
});
