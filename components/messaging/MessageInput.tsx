import { forwardRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import { useColors } from '@/lib/theme/colors';

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

const MessageInput = forwardRef<TextInput, MessageInputProps>(
  function MessageInput({ value, onChangeText, onSend }, ref) {
    const colors = useColors();
    return (
      <View className="flex-row items-center gap-[10px] px-5 py-3 border-t border-separator">
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder="Message..."
          placeholderTextColor={colors.tertiary}
          multiline
          maxLength={2000}
          style={{ borderColor: colors.separatorOpaque }}
          className="flex-1 px-[18px] py-3 rounded-full border-[1.5px] bg-bg text-[15px] text-ink tracking-[-0.2px] max-h-[100px]"
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={onSend}
        />
        <Pressable
          onPress={onSend}
          disabled={!value.trim()}
          className="w-[42px] h-[42px] rounded-full bg-ink items-center justify-center active:opacity-70 disabled:opacity-40"
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Icon name="send" size={16} color={colors.bg} />
        </Pressable>
      </View>
    );
  },
);

export default MessageInput;
