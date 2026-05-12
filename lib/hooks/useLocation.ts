import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

let cachedCoords: { latitude: number; longitude: number } | null = null;

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: cachedCoords?.latitude ?? null,
    longitude: cachedCoords?.longitude ?? null,
    loading: !cachedCoords,
    error: null,
  });

  const fetchLocation = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState((s) => ({
          ...s,
          loading: false,
          error: 'Location permission denied',
        }));
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10_000,
      });
      cachedCoords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setState({
        latitude: cachedCoords.latitude,
        longitude: cachedCoords.longitude,
        loading: false,
        error: null,
      });
    } catch {
      try {
        const last = await Location.getLastKnownPositionAsync();
        if (last) {
          cachedCoords = {
            latitude: last.coords.latitude,
            longitude: last.coords.longitude,
          };
          setState({
            latitude: cachedCoords.latitude,
            longitude: cachedCoords.longitude,
            loading: false,
            error: null,
          });
          return;
        }
      } catch (e) {
        console.warn('[location] getLastKnownPositionAsync failed:', e);
      }

      setState((s) => ({
        ...s,
        loading: false,
        error: 'Failed to get location',
      }));
    }
  }, []);

  useEffect(() => {
    if (!cachedCoords) {
      fetchLocation();
    }
  }, [fetchLocation]);

  return { ...state, refresh: fetchLocation };
}
