import React, { FC, useState } from 'react';
import { View, ViewStyle, Modal, TouchableOpacity, TextInput, StyleSheet, TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/utils/useAppTheme';
import { Button } from '@/components/general';

interface KeyboardInputButtonProps {
  onSendMessage: (text: string) => void;
}

export const KeyboardInputButton: FC<KeyboardInputButtonProps> = ({ onSendMessage }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const { themed, theme } = useAppTheme();

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      setIsModalVisible(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={themed($keyboardButtonStyle)}
        onPress={() => setIsModalVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="type" size={28} color={theme.colors.primary} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={themed($modalContent)}>
            <TextInput
              style={[themed($inputStyle), { textAlignVertical: 'top' } as TextStyle]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor={theme.colors.textDim}
              multiline
              autoFocus
              onSubmitEditing={handleSend}
            />
            <View style={$buttonContainer}>
              <Button
                preset="tertiary"
                onPress={() => setIsModalVisible(false)}
                tx="common:cancel"
                style={$modalButton}
              />
              <Button
                preset="primary"
                onPress={handleSend}
                tx="common:save"
                style={$modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const $keyboardButtonStyle: ViewStyle = {
  bottom: 10,
  padding: 12,
  borderRadius: 24,
  backgroundColor: 'white',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
};

const $modalContent: ViewStyle = {
  backgroundColor: 'white',
  padding: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  width: '100%',
  position: 'absolute',
  bottom: 0,
};

const $inputStyle: ViewStyle = {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  padding: 10,
  minHeight: 100,
  marginBottom: 10,
};

const $buttonContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: 10,
};

const $modalButton: ViewStyle = {
  minWidth: 80,
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
}); 