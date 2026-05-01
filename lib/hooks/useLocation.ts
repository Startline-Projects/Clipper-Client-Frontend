import { useCallback, useEffect, useRef, useState } from 'react';
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
  const mounted = useRef(true);

  const fetchLocation = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      if (mounted.current) {
        setState((s) => ({
          ...s,
          loading: false,
          error: 'Location permission denied',
        }));
      }
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      cachedCoords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      if (mounted.current) {
        setState({
          latitude: cachedCoords.latitude,
          longitude: cachedCoords.longitude,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      if (mounted.current) {
        setState((s) => ({
          ...s,
          loading: false,
          error: 'Failed to get location',
        }));
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!cachedCoords) {
      fetchLocation();
    }
    return () => {
      mounted.current = false;
    };
  }, [fetchLocation]);

  return { ...state, refresh: fetchLocation };
}
