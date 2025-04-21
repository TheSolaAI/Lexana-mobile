const palette = {
  backgroundFirst: '#F5F5F5',
  backgroundSecond: '#DDDDDD',
  secondaryBg: '#FFFFFF',
  text: '#1A1A1A',
  textDim: '#5A5A5A',
} as const;
export const colors = {
  palette,
  transparent: 'rgba(0, 0, 0, 0)',
  backgroundFirst: palette.backgroundFirst,
  backgroundSecond: palette.backgroundSecond,
  secondaryBg: palette.secondaryBg,
  text: palette.text,
  textDim: palette.textDim,
} as const;
