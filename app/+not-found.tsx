import { View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center bg-bg px-8">
        <Text className="text-[22px] font-extrabold text-ink tracking-[-0.5px] mb-2">
          Page not found
        </Text>
        <Link href="/" className="mt-4">
          <Text className="text-[15px] font-semibold text-brand">
            Go home
          </Text>
        </Link>
      </View>
    </>
  );
}
