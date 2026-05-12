import { useCallback, useRef } from 'react';
import { Text, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import Btn from '@/components/ui/Btn';
import { useColors } from '@/lib/theme/colors';

interface CancelRecurringSheetProps {
  visible: boolean;
  onClose: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function CancelRecurringSheet({
  visible,
  onClose,
  onCancel,
  isPending,
}: CancelRecurringSheetProps) {
  const colors = useColors();
  const sheetRef = useRef<BottomSheet>(null);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  if (!visible) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      enableDynamicSizing
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.quaternary }}
      backgroundStyle={{ backgroundColor: colors.card }}
    >
      <BottomSheetView>
        <View className="px-6 pb-10 pt-2">
          <Text className="text-[18px] font-bold text-ink mb-1">
            Cancel Series
          </Text>
          <Text className="text-[14px] text-secondary mb-6">
            This will cancel all future appointments in this recurring series.
            This action cannot be undone.
          </Text>
          <View className="gap-[10px]">
            <Btn
              label={isPending ? 'Cancelling...' : 'Cancel Series'}
              variant="danger"
              full
              onPress={onCancel}
              disabled={isPending}
            />
            <Btn
              label="Keep Series"
              variant="ghost"
              full
              onPress={onClose}
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
