import React from 'react';
import { View, ViewStyle, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/utils/useAppTheme';
import { PushToTalkButton } from './PushToTalkButton';

interface LiveModeInputBarProps {
  onAudioRecorded: (audioUri: string) => void;
  onExitLiveMode: () => void;
}

export const LiveModeInputBar: React.FC<LiveModeInputBarProps> = ({
  onAudioRecorded,
  onExitLiveMode,
}) => {
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onExitLiveMode}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={32} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonWrapper}>
          <PushToTalkButton onAudioRecorded={onAudioRecorded} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    borderRadius: 40,
    paddingHorizontal: 16,
  },
  buttonWrapper: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    borderRadius: 32,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
  },
}); 