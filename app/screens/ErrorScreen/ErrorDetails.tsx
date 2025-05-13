import { ErrorInfo } from 'react';
import { ScrollView, TextStyle, View, ViewStyle } from 'react-native';
import { Button, Screen, Text } from '../../components/general';
import type { ThemedStyle } from '@/theme';
import { useAppTheme } from '@/utils/useAppTheme';
import { TxKeyPath } from '@/i18n';

export interface ErrorDetailsProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset(): void;
}

/**
 * Renders the error details screen.
 * @param {ErrorDetailsProps} props - The props for the `ErrorDetails` component.
 * @returns {JSX.Element} The rendered `ErrorDetails` component.
 */
export function ErrorDetails(props: ErrorDetailsProps) {
  const { themed } = useAppTheme();
  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top', 'bottom']}
      contentContainerStyle={themed($contentContainer)}
    >
      <View style={$topSection}>
        <Text style={themed($heading)} preset="pageHeading" tx={"errorScreen:title" as TxKeyPath} />
        <Text tx={"errorScreen:friendlySubtitle" as TxKeyPath} />
      </View>

      <ScrollView
        style={themed($errorSection)}
        contentContainerStyle={themed($errorSectionContentContainer)}
      >
        <Text style={themed($errorContent)} text={`${props.error}`.trim()} />
        <Text
          selectable
          style={themed($errorBacktrace)}
          text={`${props.errorInfo?.componentStack ?? ''}`.trim()}
        />
      </ScrollView>

      <Button
        preset="primary"
        style={themed($resetButton)}
        onPress={props.onReset}
        tx={"errorScreen:reset" as TxKeyPath}
      />
    </Screen>
  );
}

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: 'center',
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  flex: 1,
});

const $topSection: ViewStyle = {
  flex: 1,
  alignItems: 'center',
};

const $heading: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.md,
});

const $errorSection: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 2,
  marginVertical: spacing.md,
  borderRadius: 6,
});

const $errorSectionContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
});

const $errorContent: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
});

const $errorBacktrace: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.md,
  color: colors.textDim,
});

const $resetButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.error,
  paddingHorizontal: spacing.xxl,
});
