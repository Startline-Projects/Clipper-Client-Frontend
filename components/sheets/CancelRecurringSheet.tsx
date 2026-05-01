import { forwardRef, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useColors } from '@/lib/theme/colors';

interface CancelRecurringSheetProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const CancelRecurringSheet = forwardRef<BottomSheet, CancelRecurringSheetProps>(
  function CancelRecurringSheet({ onConfirm, onCancel }, ref) {
    const colors = useColors();

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) onCancel();
      },
      [onCancel],
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        enablePanDownToClose
        enableDynamicSizing
        onChange={handleSheetChanges}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.quaternary }}
      >
        <BottomSheetView className="px-6 pb-10 pt-2">
          <Text className="text-[18px] font-bold text-ink tracking-[-0.3px] mb-4">
            Cancel this recurring booking?
          </Text>

          <View
            className="mb-4 p-[14px] rounded-lg bg-dangerPale"
            style={{ borderLeftWidth: 3, borderLeftColor: colors.red }}
          >
            <Text className="text-[13px] text-secondary leading-[19px]">
              All future appointments will be cancelled. Past and completed
              appointments stay on your history.
            </Text>
          </View>

          <Pressable
            onPress={onConfirm}
            className="items-center py-4 rounded-xl bg-red active:opacity-70 mb-2"
          >
            <Text className="text-[15px] font-semibold text-white">
              Cancel recurring
            </Text>
          </Pressable>

          <Pressable
            onPress={onCancel}
            className="items-center py-[14px] active:opacity-70"
          >
            <Text className="text-[14px] font-medium text-secondary">
              Keep it
            </Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default CancelRecurringSheet;
