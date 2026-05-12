import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/stores/auth.store';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retried?: boolean;
  }
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
if (!BASE_URL) {
  console.error('EXPO_PUBLIC_API_URL is not set — API calls will fail');
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.defaults.paramsSerializer = (params: Record<string, unknown>) => {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        parts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`,
        );
      }
    } else {
      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      );
    }
  }
  return parts.join('&');
};

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Single-flight refresh
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(token: string | null, error: unknown) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  refreshQueue = [];
}

export function clearRefreshQueue() {
  isRefreshing = false;
  flushQueue(null, { status: 0, message: 'Logged out', code: null, isNetwork: false, isTimeout: false, sessionExpired: true });
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;
    const status = error.response?.status;
    const respData = error.response?.data as { code?: string } | undefined;

    // Role mismatch — session unusable for this app, logout immediately
    if (status === 403 && respData?.code === 'FORBIDDEN_EXCEPTION') {
      await useAuthStore.getState().logout();
      return Promise.reject({ ...normalizeError(error), sessionExpired: true });
    }

    const isTokenError = status === 401;

    if (!originalRequest || !isTokenError || originalRequest._retried) {
      return Promise.reject(normalizeError(error));
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retried = true;
    isRefreshing = true;

    try {
      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      if (!refreshToken) {
        await logout();
        const sessionError = { ...normalizeError(error), sessionExpired: true };
        flushQueue(null, sessionError);
        return Promise.reject(sessionError);
      }

      const { data } = await axios.post<{
        accessToken: string;
        refreshToken: string;
      }>(`${BASE_URL}/auth/refresh`, { refreshToken });

      await setTokens(data.accessToken, data.refreshToken);
      flushQueue(data.accessToken, null);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      await useAuthStore.getState().logout();
      const sessionError = { ...normalizeError(refreshError), sessionExpired: true };
      flushQueue(null, sessionError);
      return Promise.reject(sessionError);
    } finally {
      isRefreshing = false;
    }
  },
);

export interface ApiError {
  status: number;
  message: string;
  code: string | null;
  isNetwork: boolean;
  isTimeout: boolean;
  sessionExpired?: boolean;
}

function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; code?: string }
      | undefined;
    return {
      status: error.response?.status ?? 0,
      message: data?.message ?? error.message,
      code: data?.code ?? null,
      isNetwork: !error.response,
      isTimeout: error.code === 'ECONNABORTED',
    };
  }
  return {
    status: 0,
    message: 'Unknown error',
    code: null,
    isNetwork: false,
    isTimeout: false,
  };
}
