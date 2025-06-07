import { useCallback, useRef } from 'react';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetModalProps,
  BottomSheetBackdropProps,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

import type { ReactNode, RefObject } from 'react';
import { ThemedStyle } from '@/theme';
import { ViewStyle } from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';

export interface BottomSheetCardProps
  extends Omit<BottomSheetModalProps, 'backdropComponent' | 'children'> {
  children: ReactNode;
  sheetRef?: RefObject<BottomSheetModal>;
  snapPoints?: (string | number)[];
}

/**
 * A reusable bottom sheet card with animated blur backdrop.
 * Usage: control with ref and call .present()/.close() as needed.
 */
export function BottomSheetCard({
  children,
  sheetRef,
  snapPoints = ['50%'],
  ...props
}: BottomSheetCardProps) {
  // Allow external ref or create one
  const internalRef = useRef<BottomSheetModal>(null);
  const ref = sheetRef || internalRef;

  const { themed } = useAppTheme();

  // Memoized backdrop
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );
  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      handleIndicatorStyle={themed($bottomSheetIndicatorStyle)}
      handleStyle={themed($bottomSheetHandleStyle)}
      backgroundStyle={themed($bottomSheetBackgroundStyle)}
      keyboardBehavior='interactive'
      keyboardBlurBehavior="restore"
      stackBehavior="replace"
      snapPoints={snapPoints}
      {...props}
    >
      <BottomSheetScrollView>{children}</BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const $bottomSheetBackgroundStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.secondaryBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
});

const $bottomSheetIndicatorStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.textDim,
});

const $bottomSheetHandleStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.secondaryBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
});
