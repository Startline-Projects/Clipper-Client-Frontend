import { forwardRef, useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Icon from '@/components/ui/Icon';
import Btn from '@/components/ui/Btn';
import { useColors } from '@/lib/theme/colors';
import { BARBER_CATEGORY_TAGS, categoryLabel } from '@/lib/utils/categories';
import type { BarberCategoryTag } from '@/lib/schemas/enums';

interface CategoryFilterSheetProps {
  /** Currently applied categories (source of truth from the store). */
  selected: BarberCategoryTag[];
  /** Called with the new selection when the user taps "Show results". */
  onApply: (categories: BarberCategoryTag[]) => void;
  /** Called when the sheet is dismissed without applying. */
  onClose: () => void;
}

const CategoryFilterSheet = forwardRef<BottomSheet, CategoryFilterSheetProps>(
  function CategoryFilterSheet({ selected, onApply, onClose }, ref) {
    const colors = useColors();
    const [draft, setDraft] = useState<BarberCategoryTag[]>(selected);

    // Re-sync the draft whenever the sheet is (re)opened with new applied values.
    useEffect(() => {
      setDraft(selected);
    }, [selected]);

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) onClose();
      },
      [onClose],
    );

    const toggle = useCallback((tag: BarberCategoryTag) => {
      setDraft((prev) =>
        prev.includes(tag) ? prev.filter((c) => c !== tag) : [...prev, tag],
      );
    }, []);

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
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[18px] font-bold text-ink tracking-[-0.3px]">
              Specialties
            </Text>
            {draft.length > 0 && (
              <Pressable
                onPress={() => setDraft([])}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear all specialties"
              >
                <Text className="text-[13px] font-semibold text-blue">
                  Clear all
                </Text>
              </Pressable>
            )}
          </View>
          <Text className="text-[14px] text-secondary mb-5">
            Filter barbers by the services they specialise in. Matches any
            selected tag.
          </Text>

          <View className="flex-row flex-wrap gap-[8px]">
            {BARBER_CATEGORY_TAGS.map((tag) => {
              const active = draft.includes(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => toggle(tag)}
                  style={{
                    backgroundColor: active ? colors.brandPale : colors.bgWarm,
                    borderColor: active ? colors.brand : colors.separatorOpaque,
                  }}
                  className="flex-row items-center gap-[5px] rounded-full border px-[13px] py-[9px] active:opacity-70"
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={categoryLabel(tag)}
                >
                  {active && (
                    <Icon name="check" size={13} color={colors.brand} />
                  )}
                  <Text
                    style={{ color: active ? colors.brand : colors.secondary }}
                    className="text-[13px] font-semibold tracking-[-0.1px]"
                  >
                    {categoryLabel(tag)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-6">
            <Btn
              label={
                draft.length > 0
                  ? `Show results (${draft.length})`
                  : 'Show all barbers'
              }
              full
              onPress={() => onApply(draft)}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default CategoryFilterSheet;
