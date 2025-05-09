import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';
import { Feather } from '@expo/vector-icons';
import { Text, TextField } from '@/components/general';
import { ThemedStyle } from '@/theme';
import { useAppSelector, useAppDispatch } from '@/stores/hooks';
import { setSelectedRoomId } from '@/stores/slices/selectedRoomSlice';
import { useFetchChatRoomsQuery } from '@/stores/services/chatRooms.service';

/**
 * SidebarScreen displays a search bar, quick actions, and a list of chat rooms.
 * Allows switching and creating chats.
 */
export const SidebarScreen: React.FC = () => {
  const { themed, theme } = useAppTheme();
  const [search, setSearch] = useState('');
  const dispatch = useAppDispatch();
  const selectedRoomId = useAppSelector(state => state.selectedRoom.selectedRoomId);
  const { data: chatRooms = [] } = useFetchChatRoomsQuery(undefined);

  // Placeholder for New Chat button handler
  const handleNewChat = () => {
    // TODO: Implement new chat creation logic
  };

  return (
    <View style={themed($screenContainer)}>
      {/* Search Bar */}
      <View style={themed($searchBarContainer)}>
        <TextField
          value={search}
          onChangeText={setSearch}
          placeholder="Search chats..."
          leftAccessory={<Feather name="search" size={18} color={theme.colors.textDim} />}
          containerStyle={themed($searchFieldContainer)}
          inputStyle={themed($searchFieldInput)}
        />
      </View>
      {/* Quick Actions (Horizontal Scroll) */}
      <View style={themed($quickActionsContainer)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Quick actions go here */}
        </ScrollView>
      </View>
      {/* New Chat Button */}
      <View style={themed($newChatButtonContainer)}>
        <TouchableOpacity style={themed($newChatButton)} onPress={handleNewChat}>
          <Text style={themed($newChatButtonText)}>New Chat</Text>
          <Feather name="plus" size={18} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      {/* Chat Rooms List */}
      <View style={themed($chatListContainer)}>
        <Text preset="pageSubHeading" style={themed($chatListHeader)}>
          Recents
        </Text>
        <FlatList
          data={chatRooms}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => {
            const isActive = selectedRoomId === item.id;
            return (
              <View style={$roomItemWrapper}>
                <TouchableOpacity
                  style={[themed($roomItem), isActive && themed($activeRoomItem)]}
                  onPress={() => dispatch(setSelectedRoomId(item.id))}
                >
                  <Text preset="default" numberOfLines={1} ellipsizeMode="tail">
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

// Styles
const $screenContainer: ThemedStyle<ViewStyle> = theme => ({
  flex: 1,
  backgroundColor: theme.colors.secondaryBg,
  paddingHorizontal: 12,
  paddingTop: 32,
});

const $searchBarContainer: ViewStyle = {
  marginBottom: 12,
};

const $searchFieldContainer: ViewStyle = {
  marginVertical: 0,
};

const $searchFieldInput: TextStyle = {
  fontSize: 16,
};

const $quickActionsContainer: ThemedStyle<ViewStyle> = theme => ({
  minHeight: 56,
  marginBottom: 16,
  backgroundColor: theme.colors.surface,
  borderRadius: 12,
  justifyContent: 'center',
  paddingHorizontal: 8,
});

const $newChatButtonContainer: ViewStyle = {
  height: 50,
  marginBottom: 16,
  justifyContent: 'center',
  alignItems: 'center',
};

const $newChatButton: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.colors.background,
  borderWidth: 1,
  borderColor: theme.colors.primary,
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 16,
  width: '100%',
  gap: 8,
});

const $newChatButtonText: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 16,
  fontWeight: '500',
});

const $chatListContainer: ViewStyle = {
  flex: 1,
  marginBottom: 16,
};

const $chatListHeader: TextStyle = {
  marginBottom: 8,
};

const $roomItemWrapper: ViewStyle = {
  marginBottom: 4,
  position: 'relative',
};

const $roomItem: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'transparent',
  paddingVertical: 10,
  paddingHorizontal: 8,
  borderRadius: 10,
};

const $activeRoomItem: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.primaryDark,
  borderWidth: 1,
  borderColor: theme.colors.primary + '40',
  shadowColor: theme.colors.primary,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 1.5,
  elevation: 2,
});
