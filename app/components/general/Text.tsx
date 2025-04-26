import { TOptions } from 'i18next';
import { StyleProp, Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { isRTL, translate, TxKeyPath } from '@/i18n';
import type { ThemedStyle, ThemedStyleArray } from '@/theme';
import { useAppTheme } from '@/utils/useAppTheme';
import { ReactNode, forwardRef, ForwardedRef } from 'react';

type Presets = 'default' | 'secondary' | 'pageHeading' | 'pageSubHeading' | 'heading';

export interface TextProps extends RNTextProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TxKeyPath;
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string;
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TOptions;
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<TextStyle>;
  /**
   * One of the different types of text presets.
   */
  preset?: Presets;
  /**
   * Children components.
   */
  children?: ReactNode;
}
export const Text = forwardRef(function Text(props: TextProps, ref: ForwardedRef<RNText>) {
  const { tx, txOptions, text, children, style: $styleOverride, ...rest } = props;
  const { themed } = useAppTheme();

  const i18nText = tx && translate(tx, txOptions);
  const content = i18nText || text || children;

  const preset: Presets = props.preset ?? 'default';
  const $styles: StyleProp<TextStyle> = [$rtlStyle, themed($presets[preset]), $styleOverride];

  return (
    <RNText {...rest} style={$styles} ref={ref}>
      {content}
    </RNText>
  );
});

const $baseStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontFamily: 'regular',
  fontSize: 14,
});

const $secondaryTextBaseStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  fontSize: 12,
});

const $presets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [$baseStyle],
  secondary: [$secondaryTextBaseStyle],
  pageHeading: [$baseStyle, { fontSize: 48, fontFamily: 'bold' }],
  pageSubHeading: [$secondaryTextBaseStyle, { fontSize: 15, fontFamily: 'regular' }],
  heading: [$baseStyle, { fontSize: 18, fontFamily: 'bold' }],
};
const $rtlStyle: TextStyle = isRTL ? { writingDirection: 'rtl' } : {};
