import { FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchInput from '@/components/forms/SearchInput';
import ConversationRow from '@/components/messaging/ConversationRow';
import LoadingSpinner from '@/components/feedback/LoadingSpinner';
import EmptyState from '@/components/feedback/EmptyState';
import { useConversations } from '@/lib/hooks/useConversations';
import {
  useConversationSearch,
  useFiltersStore,
} from '@/lib/stores/filters';
import { formatRelativeTime } from '@/lib/utils/format';
import type { Conversation } from '@/lib/api/conversations';

export default function MessagesScreen() {
  const router = useRouter();
  const search = useConversationSearch();
  const setSearch = useFiltersStore((s) => s.setConversationSearch);

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useConversations({ search: search || undefined });

  const conversations = data?.pages.flatMap((p) => p.conversations) ?? [];

  const renderItem = ({ item, index }: { item: Conversation; index: number }) => (
    <ConversationRow
      name={item.otherParty.name}
      lastMessage={item.lastMessageBody ?? 'No messages yet'}
      time={item.lastMessageAt ? formatRelativeTime(item.lastMessageAt) : ''}
      unread={item.unreadCount > 0}
      isLast={index === conversations.length - 1}
      onPress={() =>
        router.push(`/(app)/(tabs)/messages/${item.id}`)
      }
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5 pt-2 pb-3">
        <Text className="text-[28px] font-bold text-ink tracking-[-0.5px] mb-3">
          Messages
        </Text>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search conversations..."
        />
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon="chat"
          title="No conversations"
          subtitle={
            search
              ? 'No conversations match your search'
              : 'Book with a barber to start chatting'
          }
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <LoadingSpinner size="small" /> : null
          }
        />
      )}
    </SafeAreaView>
  );
}
