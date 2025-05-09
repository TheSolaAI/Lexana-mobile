import { useRef, useState } from 'react';
import { View, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Text } from '@/components/general';
import { $styles, ThemedStyle } from '@/theme';
import {
  useFetchChatRoomsQuery,
  useDeleteChatRoomMutation,
  useUpdateChatRoomMutation,
  useCreateChatRoomMutation,
} from '@/stores/services/chatRooms.service';
import { Screen } from '@/components/general';
import { useAppSelector, useAppDispatch } from '@/stores/hooks';
import { setSelectedRoomId } from '@/stores/slices/selectedRoomSlice';
import { BottomSheetCard } from '@/components/general/BottomSheetCard';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { toast } from 'sonner-native';
import { EditChatSheet } from '@/components/app/MenuScreenn/EditChatSheet';
import { ActionMenuSheet } from '@/components/app/MenuScreenn/ActionMenuSheet';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { AppStackScreenProps } from '@/navigators/AppNavigator';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

/**
 * MenuScreen displays a search bar, quick actions, and a list of chat rooms.
 * Allows switching and creating chats. Recent chats are shown in a card style.
 * Long press on a chat opens a bottom sheet for actions (delete/edit).
 * The currently selected chat is highlighted and shown at the top.
 * @returns {JSX.Element} The rendered MenuScreen component.
 */

interface MenuScreenProps extends AppStackScreenProps<'MenuScreen'> {}

export const MenuScreen: React.FC<MenuScreenProps> = ({ navigation }) => {
  /**
   * Global State
   */
  const { themed, theme } = useAppTheme();
  const { data: chatRooms = [], isLoading } = useFetchChatRoomsQuery();
  const selectedRoomId = useAppSelector(state => state.selectedRoom.selectedRoomId);
  const dispatch = useAppDispatch();
  const [selectedActionRoom, setSelectedActionRoom] = useState<null | { id: number; name: string }>(
    null
  );
  /**
   * Refs
   */
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const editSheetRef = useRef<BottomSheetModal>(null);

  /**
   * Mutations
   */
  const [deleteChatRoom] = useDeleteChatRoomMutation();
  const [updateChatRoom] = useUpdateChatRoomMutation();
  const [createChatRoom] = useCreateChatRoomMutation();

  /**
   * Handles long press on a chat room to open the bottom sheet.
   * @param {object} room - The chat room object.
   */
  const handleLongPressRoom = (room: { id: number; name: string }) => {
    setSelectedActionRoom(room);
    setTimeout(() => {
      bottomSheetRef.current?.present();
    }, 10);
  };

  /**
   * Handles creating a new chat room and selecting it.
   */
  const handleAddChat = async () => {
    try {
      toast.promise(createChatRoom({ name: 'New Chat' }).unwrap(), {
        loading: 'Creating...',
        success: result => {
          dispatch(setSelectedRoomId(result.id));
          navigation.goBack();
          return 'Created';
        },
        error: 'Error',
      });
    } catch {
      toast.error('Error creating chat room');
    } finally {
      setSelectedActionRoom(null);
      bottomSheetRef.current?.close();
    }
  };

  // Handler for deleting a chat room
  const handleDeleteRoom = async () => {
    if (!selectedActionRoom) return;
    try {
      toast.promise(deleteChatRoom(selectedActionRoom.id).unwrap(), {
        loading: 'Deleting...',
        success: () => {
          setSelectedActionRoom(null);
          bottomSheetRef.current?.close();
          return `Deleted ${selectedActionRoom.name}`;
        },
        error: 'Error',
      });
    } catch {
      toast.error('Error deleting chat room');
    } finally {
      setSelectedActionRoom(null);
      bottomSheetRef.current?.close();
    }
  };

  // Handler for editing a chat room (open edit bottom sheet)
  const handleEditRoom = () => {
    if (selectedActionRoom) {
      bottomSheetRef.current?.close();
      setTimeout(() => {
        editSheetRef.current?.present();
      }, 10);
    }
  };

  // Handler for saving the edited chat name
  const handleSaveEdit = async (updatedName: string) => {
    if (!selectedActionRoom) return;

    try {
      toast.promise(updateChatRoom({ id: selectedActionRoom.id, name: updatedName }).unwrap(), {
        loading: 'Saving...',
        success: () => {
          setSelectedActionRoom(null);
          editSheetRef.current?.close();
          return 'Saved';
        },
        error: 'Error',
      });
    } finally {
      setSelectedActionRoom(null);
      editSheetRef.current?.close();
    }
  };

  // Handler for canceling edit
  const handleCancelEdit = () => {
    setSelectedActionRoom(null);
    editSheetRef.current?.close();
  };

  return (
    <BottomSheetModalProvider>
      <Screen
        preset="fixed"
        safeAreaEdges={['top']}
        contentContainerStyle={themed($styles.screenContainer)}
      >
        <Animated.FlatList
          data={
            isLoading
              ? (Array.from({ length: 7 }) as any[])
              : (chatRooms as { id: number; name: string }[])
          }
          showsVerticalScrollIndicator={false}
          keyExtractor={item => {
            if (
              item &&
              typeof item === 'object' &&
              'id' in item &&
              typeof (item as any).id === 'number'
            ) {
              return (item as any).id.toString();
            }
            return Math.random().toString();
          }}
          itemLayoutAnimation={LinearTransition.springify().damping(10).stiffness(100)}
          renderItem={({ item }) => {
            // If loading or placeholder, render skeleton
            if (isLoading || chatRooms.length === 0) {
              return (
                <SkeletonPlaceholder
                  enabled={true}
                  backgroundColor={theme.colors.secondaryBg}
                  highlightColor={theme.colors.surface}
                >
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    alignItems="center"
                    marginBottom={30}
                  >
                    <SkeletonPlaceholder.Item width={40} height={40} borderRadius={10} />
                    <SkeletonPlaceholder.Item
                      width={200}
                      height={20}
                      marginLeft={10}
                      borderRadius={5}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
              );
            }
            // Render actual chat room
            const chatRoom = item as { id: number; name: string };
            const isSelected = chatRoom.id === selectedRoomId;
            return (
              <View style={isSelected ? themed($selectedChatContainerStyle) : null}>
                <TouchableOpacity
                  style={[themed($chatCardStyle), isSelected && themed($selectedChatCardStyle)]}
                  onPress={() => {
                    dispatch(setSelectedRoomId(chatRoom.id));
                    navigation.goBack();
                  }}
                  onLongPress={() => handleLongPressRoom(chatRoom)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      themed($chatIconContainer),
                      isSelected && themed($selectedChatIconStyle),
                    ]}
                  >
                    <MaterialIcons
                      name={isSelected ? 'chat-bubble' : 'chat-bubble-outline'}
                      size={22}
                      color={isSelected ? theme.colors.text : theme.colors.textDim}
                    />
                  </View>
                  <Text preset="default" style={isSelected && $selectedChatTextStyle}>
                    {chatRoom.name}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListHeaderComponent={
            <>
              <View style={$headerStyle}>
                <TouchableOpacity
                  style={themed($userIconContainer)}
                  onPress={() => {
                    navigation.goBack();
                  }}
                >
                  <Feather name="x" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={themed($userIconContainer)}
                  onPress={() => {
                    navigation.navigate('SettingsScreen');
                  }}
                >
                  <Feather name="user" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <Text
                tx="menuScreen:recentSearches"
                preset="onboardingSubHeading"
                style={$sectionHeaderStyle}
              />
              <View style={$placeholderStyle} />
              <Text
                tx="menuScreen:recentChats"
                preset="onboardingSubHeading"
                style={$sectionHeaderStyle}
              />
            </>
          }
        />

        {/* Bottom Sheet for actions */}
        <BottomSheetCard sheetRef={bottomSheetRef}>
          <ActionMenuSheet onEdit={handleEditRoom} onDelete={handleDeleteRoom} />
        </BottomSheetCard>
        {/* Bottom Sheet for editing chat name */}
        <BottomSheetCard sheetRef={editSheetRef}>
          <EditChatSheet
            value={selectedActionRoom?.name || ''}
            onSave={name => handleSaveEdit(name)}
            onCancel={handleCancelEdit}
          />
        </BottomSheetCard>
      </Screen>
      <TouchableOpacity style={themed($fab)} onPress={handleAddChat}>
        <MaterialIcons name="add" size={32} color={theme.colors.text} />
      </TouchableOpacity>
    </BottomSheetModalProvider>
  );
};

// Styles
const $headerStyle: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 16,
};

const $userIconContainer: ThemedStyle<ViewStyle> = theme => ({
  width: 40,
  height: 40,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.colors.secondaryBg,
  borderWidth: 1,
  borderColor: theme.colors.border,
});

const $sectionHeaderStyle: TextStyle = {
  marginBottom: 20,
  fontSize: 18,
  fontWeight: '600',
};

const $placeholderStyle: ViewStyle = {
  height: 100,
};

const $chatCardStyle: ViewStyle = {
  paddingVertical: 10,
  flexDirection: 'row',
  marginBottom: 5,
  alignItems: 'center',
};

const $selectedChatContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  borderRadius: 12,
  backgroundColor: theme.colors.secondaryBg,
  marginBottom: 5,
});

const $selectedChatCardStyle: ViewStyle = {
  marginBottom: 0,
  paddingHorizontal: 10,
  paddingVertical: 12,
};

const $selectedChatTextStyle: TextStyle = {
  fontWeight: '500',
};

const $chatIconContainer: ThemedStyle<ViewStyle> = theme => ({
  padding: 10,
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
  backgroundColor: theme.colors.secondaryBg,
});

const $selectedChatIconStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.primary + '20', // Add slight transparency to the primary color
});

const $fab: ThemedStyle<ViewStyle> = theme => ({
  position: 'absolute',
  right: 24,
  bottom: 24,
  padding: 20,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.colors.primary,
});
