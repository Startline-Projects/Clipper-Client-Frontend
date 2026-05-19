import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/feedback/EmptyState';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useMessages, useSendMessage } from '@/lib/hooks/useMessages';
import { useRealtimeMessages } from '@/lib/hooks/useRealtimeMessages';
import { useConversations } from '@/lib/hooks/useConversations';
import { queryKeys } from '@/lib/hooks/queryKeys';
import type { ConversationListResponse } from '@/lib/api/conversations';
import MessageBubble from '@/components/messaging/MessageBubble';
import MessageInput from '@/components/messaging/MessageInput';
import { useColors } from '@/lib/theme/colors';
import { showErrorToast } from '@/lib/feedback/toast';

export default function ChatScreen() {
  const router = useRouter();
  const { conversationId, name, photo } = useLocalSearchParams<{
    conversationId: string;
    name?: string;
    photo?: string;
  }>();
  const colors = useColors();
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const needsLookup = !name;
  const convoQuery = useConversations({}, needsLookup);
  const otherParty = needsLookup
    ? convoQuery.data?.pages
        .flatMap((p) => p.conversations)
        .find((c) => c.id === conversationId)?.otherParty
    : undefined;

  const displayName = name || otherParty?.name || 'Chat';
  const displayPhoto = photo || otherParty?.profilePhotoUrl || undefined;

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId);
  const send = useSendMessage(conversationId);

  useRealtimeMessages(conversationId);

  useEffect(() => {
    qc.setQueriesData<InfiniteData<ConversationListResponse>>(
      { queryKey: queryKeys.conversations.lists() },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            conversations: page.conversations.map((c) =>
              c.id === conversationId ? { ...c, unreadCount: 0 } : c,
            ),
          })),
        };
      },
    );
  }, [conversationId, qc]);

  const didInvalidate = useRef(false);
  useEffect(() => {
    if (!isLoading && data && !didInvalidate.current) {
      didInvalidate.current = true;
      qc.invalidateQueries({ queryKey: queryKeys.conversations.lists() });
    }
  }, [isLoading, data, qc]);

  const messages = data?.messages ?? [];

  const textRef = useRef(text);
  textRef.current = text;

  const handleSend = useCallback(() => {
    const body = textRef.current.trim();
    if (!body || send.isPending) return;
    setText('');
    send.mutate(body, {
      onError: (err) => {
        setText(body);
        showErrorToast(err);
      },
    });
  }, [send]);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header
          title={displayName}
          onBack={() => router.navigate('/(app)/(tabs)/messages')}
          right={
            <Avatar name={displayName} uri={displayPhoto} size={32} />
          }
        />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.tertiary} />
          </View>
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
            inverted
            contentContainerClassName="px-5 py-2"
            removeClippedSubviews
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={7}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator className="py-4" color={colors.tertiary} />
              ) : null
            }
            renderItem={({ item }) => <MessageBubble message={item} />}
          />
        )}

        <MessageInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          onSend={handleSend}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
