import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import Btn from '@/components/ui/Btn';
import StarRow from '@/components/ui/StarRow';
import TextArea from '@/components/forms/TextArea';
import { useCreateReview } from '@/lib/hooks/useReviews';
import { showSuccessToast, showErrorToast } from '@/lib/feedback/toast';

export default function WriteReviewScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const createReview = useCreateReview();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const canSubmit = rating > 0;

  const handleSubmit = () => {
    if (!canSubmit || !bookingId || createReview.isPending) return;
    createReview.mutate(
      {
        bookingId,
        body: {
          rating,
          comment: comment.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          showSuccessToast('Review submitted — thanks for your feedback!');
          router.back();
        },
        onError: (err) => showErrorToast(err),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="px-5">
          <Header title="Leave a Review" onBack={() => router.back()} />
        </View>

        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pb-8"
        >
          <Text className="text-[14px] text-secondary leading-[20px] tracking-[-0.1px] mb-6">
            How was your experience? Tap the stars to rate and optionally leave
            a comment.
          </Text>

          <View className="items-center mb-6">
            <StarRow value={rating} size={36} onChange={setRating} />
            {rating > 0 && (
              <Text className="text-[14px] font-semibold text-ink mt-2">
                {rating}/5
              </Text>
            )}
          </View>

          <TextArea
            label="Comment (optional)"
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us about your experience…"
            maxLength={1000}
          />

          <Text className="text-[11px] text-tertiary text-right mt-1 mb-6">
            {comment.length}/1000
          </Text>

          <Btn
            label={createReview.isPending ? 'Submitting...' : 'Submit Review'}
            full
            onPress={handleSubmit}
            disabled={!canSubmit || createReview.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
