import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const safeStorage: StateStorage = {
  getItem: async (name) => {
    try { return await AsyncStorage.getItem(name); }
    catch { return null; }
  },
  setItem: async (name, value) => {
    try { await AsyncStorage.setItem(name, value); }
    catch {}
  },
  removeItem: async (name) => {
    try { await AsyncStorage.removeItem(name); }
    catch {}
  },
};

export interface SavedCard {
  paymentMethodId: string;
  last4: string;
  brand: string;
}

interface PaymentMethodState {
  savedCard: SavedCard | null;
  subscribedPlan: 'monthly' | 'yearly' | null;
  setSavedCard: (card: SavedCard) => void;
  clearSavedCard: () => void;
  setSubscribedPlan: (plan: 'monthly' | 'yearly') => void;
  clearSubscribedPlan: () => void;
}

export const usePaymentMethodStore = create<PaymentMethodState>()(
  persist(
    (set) => ({
      savedCard: null,
      subscribedPlan: null,
      setSavedCard: (card) => set({ savedCard: card }),
      clearSavedCard: () => set({ savedCard: null }),
      setSubscribedPlan: (plan) => set({ subscribedPlan: plan }),
      clearSubscribedPlan: () => set({ subscribedPlan: null }),
    }),
    {
      name: 'clipper_payment_method',
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ savedCard: s.savedCard, subscribedPlan: s.subscribedPlan }),
    },
  ),
);

export const useSavedCard = () => usePaymentMethodStore((s) => s.savedCard);
export const useSubscribedPlan = () => usePaymentMethodStore((s) => s.subscribedPlan);
