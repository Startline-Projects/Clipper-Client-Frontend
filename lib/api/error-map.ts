import type { ApiError } from './client';

export interface MappedError {
  title: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
  status?: number;
  isNetwork: boolean;
  isTimeout: boolean;
  isAuth: boolean;
  isSubscriptionRequired: boolean;
}

export function isApiError(err: unknown): err is ApiError {
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, unknown>;
  return typeof e.status === 'number' && typeof e.message === 'string';
}

export function mapApiError(err: unknown): MappedError {
  const base: MappedError = {
    title: 'Something went wrong',
    message: 'An unexpected error occurred',
    severity: 'error',
    isNetwork: false,
    isTimeout: false,
    isAuth: false,
    isSubscriptionRequired: false,
  };

  if (!isApiError(err)) return base;

  base.code = err.code ?? undefined;
  base.status = err.status;
  base.isNetwork = err.isNetwork;
  base.isTimeout = err.isTimeout;

  if (err.isTimeout) {
    base.title = 'Request timed out';
    base.message = 'Try again in a moment';
    return base;
  }

  if (err.isNetwork) {
    base.title = 'No connection';
    base.message = 'Check your internet and try again';
    return base;
  }

  if (err.code) {
    switch (err.code) {
      case 'SUBSCRIPTION_REQUIRED':
        base.title = 'Subscription required';
        base.message = 'Subscribe to access this feature';
        base.isSubscriptionRequired = true;
        return base;
      case 'PLAN_DOWNGRADE_NOT_ALLOWED':
        base.title = "Can't downgrade";
        base.message =
          'Downgrading to monthly is not supported. Please cancel and re-subscribe.';
        return base;
      case 'SUBSCRIPTION_NOT_SCHEDULED_FOR_CANCELLATION':
        base.title = 'Unable to reactivate';
        base.message = 'Your subscription is not scheduled for cancellation.';
        return base;
      case 'ACTIVE_SUBSCRIPTION':
        base.title = 'Already subscribed';
        base.message = 'You already have an active subscription';
        return base;
      case 'ACTIVE_RECURRING':
        base.title = 'Active series exists';
        base.message = 'Cancel your current recurring booking first';
        return base;
    }
  }

  if (err.status === 401) {
    base.title = 'Session expired';
    base.message = 'Please sign in again';
    base.isAuth = true;
    return base;
  }
  if (err.status === 403) {
    base.title = 'Not allowed';
    base.message = "You don't have permission";
    return base;
  }
  if (err.status === 404) {
    base.title = 'Not found';
    base.message = 'This item may have been removed';
    return base;
  }
  if (err.status === 409) {
    base.title = 'Conflict';
    base.message = err.message || 'Someone else made a change';
    return base;
  }
  if (err.status === 400) {
    base.title = 'Invalid request';
    base.message = err.message || 'Please check your input';
    return base;
  }
  if (err.status >= 500) {
    base.title = 'Server error';
    base.message = 'Something went wrong on our end';
    return base;
  }

  base.message = err.message || base.message;
  return base;
}
