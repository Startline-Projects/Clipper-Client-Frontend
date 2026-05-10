import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchInput from '@/components/forms/SearchInput';
import ConversationRow from '@/components/messaging/ConversationRow';
import { ConversationRowSkeleton } from '@/components/feedback/SkeletonVariants';
import EmptyState from '@/components/feedback/EmptyState';
import { useConversations } from '@/lib/hooks/useConversations';
import {
  useConversationSearch,
  useFiltersStore,
} from '@/lib/stores/filters';
import { useColors } from '@/lib/theme/colors';
import { formatRelativeTime } from '@/lib/utils/format';
import type { Conversation } from '@/lib/api/conversations';

export default function MessagesScreen() {
  const router = useRouter();
  const colors = useColors();
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
      avatarUri={item.otherParty.profilePhotoUrl}
      lastMessage={item.lastMessageBody ?? 'No messages yet'}
      time={item.lastMessageAt ? formatRelativeTime(item.lastMessageAt) : ''}
      unread={item.unreadCount > 0}
      isLast={index === conversations.length - 1}
      onPress={() =>
        router.push({
          pathname: `/(app)/(tabs)/messages/${item.id}`,
          params: { name: item.otherParty.name, photo: item.otherParty.profilePhotoUrl ?? '' },
        })
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
        <View>
          {[1, 2, 3, 4, 5].map((i) => (
            <ConversationRowSkeleton key={i} />
          ))}
        </View>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon="chat"
          title={search ? 'No results' : 'No conversations'}
          body={
            search
              ? 'No conversations match your search'
              : 'Book with a barber to start chatting'
          }
          cta={
            search
              ? undefined
              : { label: 'Find a barber', onPress: () => router.push('/(app)/(tabs)/explore') }
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
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color={colors.tertiary} style={{ paddingVertical: 16 }} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
