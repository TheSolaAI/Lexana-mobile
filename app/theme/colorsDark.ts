const palette = {
  background: '#0A0A0A',
  baseBackground: '#000000',
  sec_background: '#141414',
  surface: '#1E1E1E',
  textColor: '#F5F5F5',
  secText: '#A8A8A8',
  border: '#333333',
  primary: '#52357B',
  primaryDark: '#3b2659',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
} as const;

export const colors = {
  palette,
  transparent: 'rgba(0, 0, 0, 0)',
  background: palette.background,
  baseBackground: palette.baseBackground,
  secondaryBg: palette.sec_background,
  surface: palette.surface,
  text: palette.textColor,
  textDim: palette.secText,
  border: palette.border,
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  success: palette.success,
  error: palette.error,
  warning: palette.warning,
} as const;
