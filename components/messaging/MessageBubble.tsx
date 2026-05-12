import { memo } from 'react';
import { Text, View } from 'react-native';
import type { Message } from '@/lib/api/conversations';

function formatMsgTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default memo(function MessageBubble({ message: m }: { message: Message }) {
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
})
