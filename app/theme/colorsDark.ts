const palette = {
  backgroundFirst: '#000000',
  backgroundSecond: '#434343',
  secondaryBg: '#1E1E1E',
  text: '#FAFAFA',
  textDim: '#B0B0B0',
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
