import { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface PriceInputProps extends Omit<TextInputProps, 'className' | 'keyboardType'> {
  label: string;
  error?: string;
  variant?: 'default' | 'emphasized';
}

const PriceInput = forwardRef<TextInput, PriceInputProps>(function PriceInput(
  { label, error, variant = 'default', ...inputProps },
  ref,
) {
  const emphasized = variant === 'emphasized';

  return (
    <View className="w-full">
      <Text className="text-[13px] font-semibold text-secondary mb-[6px] tracking-[-0.1px]">
        {label}
      </Text>
      <View className="relative">
        <View className="absolute left-4 top-0 bottom-0 z-10 justify-center">
          <Text
            className={`font-bold tracking-[-0.3px] ${
              emphasized ? 'text-[20px] text-ink' : 'text-[16px] text-secondary'
            }`}
          >
            $
          </Text>
        </View>
        <TextInput
          ref={ref}
          keyboardType="numeric"
          {...inputProps}
          className={`w-full pl-[32px] pr-4 rounded-md border-[1.5px] bg-surface tracking-[-0.2px] focus:border-ink placeholder:text-tertiary ${
            emphasized
              ? 'py-4 text-[20px] font-bold text-ink'
              : 'py-[14px] text-[16px] font-medium text-ink'
          } ${error ? 'border-red' : 'border-separator-opaque'}`}
        />
      </View>
      {error && (
        <Text className="text-[12px] text-red mt-[4px] tracking-[-0.1px]">
          {error}
        </Text>
      )}
    </View>
  );
});

export default PriceInput;
