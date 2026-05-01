import { forwardRef, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useColors } from '@/lib/theme/colors';

interface CancelSubscriptionSheetProps {
  periodEndDate: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const CancelSubscriptionSheet = forwardRef<
  BottomSheet,
  CancelSubscriptionSheetProps
>(
  function CancelSubscriptionSheet(
    { periodEndDate, onConfirm, onCancel },
    ref,
  ) {
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
            Cancel subscription?
          </Text>

          <View
            className="mb-4 p-[14px] rounded-lg bg-dangerPale"
            style={{ borderLeftWidth: 3, borderLeftColor: colors.red }}
          >
            <Text className="text-[13px] text-secondary leading-[19px]">
              You'll keep access until {periodEndDate}. No refunds, no
              mid-period termination.
            </Text>
          </View>

          <Pressable
            onPress={onConfirm}
            className="items-center py-4 rounded-xl bg-red active:opacity-70 mb-2"
          >
            <Text className="text-[15px] font-semibold text-white">
              Cancel at period end
            </Text>
          </Pressable>

          <Pressable
            onPress={onCancel}
            className="items-center py-[14px] active:opacity-70"
          >
            <Text className="text-[14px] font-medium text-secondary">
              Keep subscription
            </Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default CancelSubscriptionSheet;
