import { FC } from 'react';
import { View, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from '@/components/general/Text';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';

interface ActionMenuSheetProps {
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * ActionMenuSheet is a bottom sheet UI for chat actions (edit/delete).
 * It matches the MenuScreen style, uses icons in views with backgrounds, and matches text presets.
 */
export const ActionMenuSheet: FC<ActionMenuSheetProps> = ({ onEdit, onDelete }) => {
  const { themed, theme } = useAppTheme();
  return (
    <View>
      <TouchableOpacity onPress={onEdit} style={themed($sheetButton)}>
        <View style={themed($iconRow)}>
          <View style={themed($iconCircle)}>
            <MaterialIcons name="edit" size={22} color={theme.colors.textDim} />
          </View>
          <Text preset="default" tx="menuScreen:editChatName" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={themed($sheetButton)}>
        <View style={themed($iconRow)}>
          <View style={themed($iconCircle)}>
            <MaterialIcons name="delete" size={22} color={theme.colors.textDim} />
          </View>
          <Text preset="default" tx="menuScreen:deleteChat" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const $iconRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: 'row',
  alignItems: 'center',
});

const $iconCircle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.background,
  borderRadius: 15,
  padding: 10,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
});

const $sheetButton: ViewStyle = {
  paddingVertical: 14,
  paddingHorizontal: 12,
};

const $sheetButtonDelete: TextStyle = {
  color: '#FF3B30',
};
