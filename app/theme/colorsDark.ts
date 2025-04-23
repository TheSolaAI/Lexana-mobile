const palette = {
  background: '#050505',
  secondaryBg: '#1B1B1B',
  text: '#D9D9D9',
  textDim: '#838383',
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
