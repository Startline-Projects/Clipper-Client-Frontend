import { useCallback, useRef, useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Btn from '@/components/ui/Btn';
import Icon from '@/components/ui/Icon';
import { useColors } from '@/lib/theme/colors';

interface PauseRecurringSheetProps {
  visible: boolean;
  onClose: () => void;
  onPause: (pauseEndDate?: string) => void;
  isPending: boolean;
}

export default function PauseRecurringSheet({
  visible,
  onClose,
  onPause,
  isPending,
}: PauseRecurringSheetProps) {
  const colors = useColors();
  const sheetRef = useRef<BottomSheet>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [weeksOut, setWeeksOut] = useState(2);

  const handleClose = useCallback(() => {
    onClose();
    setHasEndDate(false);
    setWeeksOut(2);
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
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

  const getPauseEndDate = () => {
    if (!hasEndDate) return undefined;
    const d = new Date();
    d.setDate(d.getDate() + weeksOut * 7);
    return d.toISOString().slice(0, 10);
  };

  if (!visible) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      enableDynamicSizing
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.quaternary }}
      backgroundStyle={{ backgroundColor: colors.card }}
    >
      <BottomSheetView>
        <View className="px-6 pb-8 pt-2">
          <Text className="text-[18px] font-bold text-ink mb-1">
            Pause Series
          </Text>
          <Text className="text-[14px] text-secondary mb-5">
            No new appointments will be scheduled while paused.
          </Text>

          <Pressable
            className="flex-row items-center justify-between py-3 mb-2"
            onPress={() => setHasEndDate(!hasEndDate)}
          >
            <Text className="text-[14px] text-ink">Set resume date</Text>
            <View
              className={`w-5 h-5 rounded border items-center justify-center ${
                hasEndDate ? 'bg-blue border-blue' : 'border-separator'
              }`}
            >
              {hasEndDate && <Icon name="check" size={12} color="#fff" />}
            </View>
          </Pressable>

          {hasEndDate && (
            <View className="flex-row items-center gap-3 mb-4">
              <Pressable
                onPress={() => setWeeksOut(Math.max(1, weeksOut - 1))}
                className="w-9 h-9 rounded-full bg-bgHover items-center justify-center"
              >
                <Text className="text-[18px] text-ink">{'−'}</Text>
              </Pressable>
              <Text className="text-[15px] font-semibold text-ink min-w-[100px] text-center">
                {weeksOut} {weeksOut === 1 ? 'week' : 'weeks'}
              </Text>
              <Pressable
                onPress={() => setWeeksOut(Math.min(12, weeksOut + 1))}
                className="w-9 h-9 rounded-full bg-bgHover items-center justify-center"
              >
                <Text className="text-[18px] text-ink">+</Text>
              </Pressable>
            </View>
          )}

          <View className="gap-[10px]">
            <Btn
              label={isPending ? 'Pausing...' : 'Pause Series'}
              variant="primary"
              full
              icon="pause"
              onPress={() => onPause(getPauseEndDate())}
              disabled={isPending}
            />
            <Btn label="Cancel" variant="ghost" full onPress={handleClose} />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
