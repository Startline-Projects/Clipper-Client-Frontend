import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useStartConversation } from './useConversations';

export function useBarberChat(barberId: string, barberName: string) {
  const router = useRouter();
  const startConvo = useStartConversation();

  const openChat = () => {
    startConvo.mutate(barberId, {
      onSuccess: (conversation) => {
        router.push(`/(app)/(tabs)/messages/${conversation.id}`);
      },
      onError: () => {
        Alert.alert(
          'Could not open chat',
          `Unable to message ${barberName}. Please try again.`,
        );
      },
    });
  };

  return { openChat, isPending: startConvo.isPending };
}
