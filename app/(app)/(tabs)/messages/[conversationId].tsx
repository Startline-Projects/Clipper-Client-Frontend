import { useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import MessageBubble from '@/components/messaging/MessageBubble';
import MessageInput from '@/components/messaging/MessageInput';
import { MessagesListSkeleton } from '@/components/feedback/SkeletonVariants';
import EmptyState from '@/components/feedback/EmptyState';
import { useMessages, useSendMessage } from '@/lib/hooks/useMessages';
import { useRealtimeMessages } from '@/lib/hooks/useRealtimeMessages';
import { useColors } from '@/lib/theme/colors';
import { formatTime } from '@/lib/utils/format';
import type { Message } from '@/lib/api/conversations';

export default function ChatScreen() {
  const router = useRouter();
  const { conversationId, name } = useLocalSearchParams<{
    conversationId: string;
    name?: string;
  }>();
  const colors = useColors();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId);
  const send = useSendMessage(conversationId);

  useRealtimeMessages(conversationId);

  const messages = data?.messages ?? [];

  const handleSend = useCallback(() => {
    const body = text.trim();
    if (!body || send.isPending) return;
    setText('');
    send.mutate(body);
    setTimeout(() => listRef.current?.scrollToIndex({ index: 0, animated: true }), 100);
  }, [text, send]);

  const renderItem = ({ item }: { item: Message }) => (
    <MessageBubble
      body={item.body}
      time={formatTime(item.createdAt.slice(11, 16))}
      isOwn={item.senderRole === 'client'}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <View className="px-5">
        <Header title={name ?? 'Chat'} onBack={() => router.back()} />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <MessagesListSkeleton />
        ) : messages.length === 0 ? (
          <View className="flex-1 justify-center">
            <EmptyState
              icon="chat"
              title="No messages yet"
              body="Send a message to get started"
            />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            inverted
            contentContainerClassName="px-4 py-3"
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator size="small" color={colors.tertiary} style={{ paddingVertical: 12 }} />
              ) : null
            }
          />
        )}

        <View className="px-4 pb-2">
          <MessageInput
            value={text}
            onChangeText={setText}
            onSend={handleSend}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
