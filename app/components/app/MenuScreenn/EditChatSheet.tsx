import { FC, useState } from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from '../../general/Text';
import { ThemedStyle } from '@/theme';
import { useAppTheme } from '@/utils/useAppTheme';
import { Button } from '@/components/general';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

interface EditChatSheetProps {
  value: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

/**
 * EditChatSheet is a bottom sheet UI for editing a chat name.
 */
export const EditChatSheet: FC<EditChatSheetProps> = ({ value, onSave, onCancel }) => {
  const [chatName, setChatName] = useState(value);

  const { themed, theme } = useAppTheme();
  return (
    <View style={$editSheetContainer}>
      <Text preset="onboardingSubHeading" tx="menuScreen:editChatName" />
      <BottomSheetTextInput
        value={chatName}
        onChangeText={text => {
          setChatName(text);
        }}
        style={themed($editInput)}
        placeholder={value}
        placeholderTextColor={theme.colors.textDim}
        // autoFocus={true}
      />
      <View style={$editSheetButtonRow}>
        <Button preset="tertiary" onPress={onCancel} tx="common:cancel" style={$editSheetButton} />
        <Button
          preset="primary"
          onPress={() => onSave(chatName)}
          tx="common:save"
          style={$editSheetButton}
        />
      </View>
    </View>
  );
};

const $editSheetContainer: ViewStyle = {
  padding: 10,
  paddingBottom: 20,
};

const $editInput: ThemedStyle<any> = theme => ({
  borderWidth: 2,
  borderColor: theme.colors.border,
  borderRadius: 10,
  padding: 10,
  fontSize: 16,
  backgroundColor: theme.colors.secondaryBg,
  color: theme.colors.text,
  marginTop: 10,
  minHeight: 50,
});

const $editSheetButtonRow: ViewStyle = {
  flexDirection: 'row',
  marginTop: 20,
  gap: 8,
  justifyContent: 'flex-end',
};

const $editSheetButton: ViewStyle = {
  minHeight: 40,
};
