const palette = {
  background: '#F5F5F5',
  secondaryBg: '#E8E8E8',
  text: '#1A1A1A',
  textDim: '#777777',
  primary: '#5677F3',
} as const;

export const colors = {
  palette,
  transparent: 'rgba(0, 0, 0, 0)',
  background: palette.background,
  secondaryBg: palette.secondaryBg,
  text: palette.text,
  textDim: palette.textDim,
  primary: palette.primary,
} as const;
