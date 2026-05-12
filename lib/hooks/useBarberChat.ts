import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useStartConversation } from './useConversations';

export function useBarberChat(barberId: string, barberName: string) {
  const router = useRouter();
  const startConvo = useStartConversation();

  const openChat = () => {
    if (!barberId) {
      Alert.alert('Could not open chat', 'Barber information not available.');
      return;
    }
    startConvo.mutate(barberId, {
      onSuccess: (conversation) => {
        router.navigate(`/(app)/(tabs)/messages/${conversation.id}`);
      },
      onError: (err) => {
        console.error('[useBarberChat] error:', err);
        Alert.alert(
          'Could not open chat',
          `Unable to message ${barberName}. Please try again.`,
        );
      },
    });
  };

  return { openChat, isPending: startConvo.isPending };
}
