import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface TextAreaProps extends Omit<TextInputProps, 'className' | 'multiline'> {
  label: string;
}

export default function TextArea({ label, ...inputProps }: TextAreaProps) {
  return (
    <View className="w-full">
      <Text className="text-[13px] font-semibold text-secondary mb-[6px] tracking-[-0.1px]">
        {label}
      </Text>
      <TextInput
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        {...inputProps}
        className="w-full px-[14px] py-[13px] rounded-md border-[1.5px] border-separator-opaque bg-surface text-[15px] font-medium text-ink tracking-[-0.2px] focus:border-ink placeholder:text-tertiary min-h-[90px]"
      />
    </View>
  );
}
