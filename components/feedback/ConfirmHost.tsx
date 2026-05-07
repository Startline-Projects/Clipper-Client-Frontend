import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Btn from '@/components/ui/Btn';
import { useColors } from '@/lib/theme/colors';
import {
  subscribeConfirm,
  resolveConfirm,
  type ConfirmOptions,
} from '@/lib/feedback/confirm';

export default function ConfirmHost() {
  const colors = useColors();
  const sheetRef = useRef<BottomSheet>(null);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  useEffect(() => subscribeConfirm(setOptions), []);

  useEffect(() => {
    if (options) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [options]);

  const handleClose = useCallback(() => {
    resolveConfirm(false);
  }, []);

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

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      enableDynamicSizing
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.quaternary }}
      backgroundStyle={{ backgroundColor: colors.card }}
    >
      <BottomSheetView>
        {options && (
          <View className="px-6 pb-8 pt-2">
            <Text className="text-[18px] font-bold text-ink mb-1">
              {options.title}
            </Text>
            {options.message && (
              <Text className="text-[14px] text-secondary mb-6">
                {options.message}
              </Text>
            )}
            <View className="gap-[10px]">
              <Btn
                label={
                  options.confirmLabel ??
                  (options.destructive ? 'Confirm' : 'OK')
                }
                variant={options.destructive ? 'danger' : 'primary'}
                full
                onPress={() => resolveConfirm(true)}
              />
              <Btn
                label={options.cancelLabel ?? 'Cancel'}
                variant="ghost"
                full
                onPress={() => resolveConfirm(false)}
              />
            </View>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}
