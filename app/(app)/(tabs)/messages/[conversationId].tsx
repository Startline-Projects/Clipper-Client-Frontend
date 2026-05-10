import { useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import EmptyState from '@/components/feedback/EmptyState';
import { useMessages, useSendMessage } from '@/lib/hooks/useMessages';
import { useRealtimeMessages } from '@/lib/hooks/useRealtimeMessages';
import { useConversations } from '@/lib/hooks/useConversations';
import { useColors } from '@/lib/theme/colors';
import { showErrorToast } from '@/lib/feedback/toast';
import type { Message } from '@/lib/api/conversations';

function formatMsgTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function ChatBubble({ message: m }: { message: Message }) {
  const isOwn = m.senderRole === 'client';

  return (
    <View
      className={`flex-row mb-[6px] ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <View
        className={`max-w-[78%] px-[14px] py-[10px] rounded-[20px] ${
          isOwn
            ? 'bg-ink rounded-br-[6px]'
            : 'bg-surface rounded-bl-[6px]'
        }`}
      >
        <Text
          className={`text-[15px] leading-[21px] tracking-[-0.2px] ${
            isOwn ? 'text-bg' : 'text-ink'
          }`}
        >
          {m.body}
        </Text>
        <Text
          className={`text-[11px] mt-1 text-right ${
            isOwn ? 'text-tertiary' : 'text-secondary'
          }`}
        >
          {formatMsgTime(m.createdAt)}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const { conversationId, name, photo } = useLocalSearchParams<{
    conversationId: string;
    name?: string;
    photo?: string;
  }>();
  const colors = useColors();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const convoQuery = useConversations({});
  const otherParty = convoQuery.data?.pages
    .flatMap((p) => p.conversations)
    .find((c) => c.id === conversationId)?.otherParty;

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

  const messages = data?.messages ?? [];

  const handleSend = useCallback(() => {
    const body = text.trim();
    if (!body || send.isPending) return;
    setText('');
    send.mutate(body, {
      onError: (err) => showErrorToast(err),
    });
  }, [text, send]);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5">
        <Header
          title={displayName}
          onBack={() => router.back()}
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
            renderItem={({ item }) => <ChatBubble message={item} />}
          />
        )}

        <View className="flex-row items-center gap-[10px] px-5 py-3 border-t border-separator">
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            placeholderTextColor={colors.tertiary}
            multiline
            style={{ borderColor: colors.tertiary }}
            className="flex-1 px-[18px] py-3 rounded-3xl border-[1.5px] bg-bg text-[15px] text-ink tracking-[-0.2px] max-h-[100px]"
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
          <Pressable
            onPress={handleSend}
            className="w-[42px] h-[42px] rounded-full bg-ink items-center justify-center"
            accessibilityLabel="Send message"
          >
            <Icon name="send" size={16} color={colors.bg} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
