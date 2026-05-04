import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { z } from 'zod';
import { ThemePreference } from '@/lib/schemas/enums';

type ThemePref = z.infer<typeof ThemePreference>;

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

interface ThemeState {
  themePreference: ThemePref;
  hasHydrated: boolean;
  setThemePreference: (pref: ThemePref) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themePreference: 'system',
      hasHydrated: false,
      setThemePreference: (pref) => {
        const parsed = ThemePreference.safeParse(pref);
        if (parsed.success) set({ themePreference: parsed.data });
      },
    }),
    {
      name: 'clipper_theme_preference',
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ themePreference: s.themePreference }),
      onRehydrateStorage: () => () => {
        useThemeStore.setState({ hasHydrated: true });
      },
    },
  ),
);

export const useThemePreference = () => useThemeStore((s) => s.themePreference);
export const useThemeHasHydrated = () => useThemeStore((s) => s.hasHydrated);
export const useSetThemePreference = () => useThemeStore((s) => s.setThemePreference);
