import { HttpErrorResponse } from '@angular/common/http';

export function extractApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof HttpErrorResponse) {
    const payload = error.error as { message?: string | string[] } | string | null;

    if (typeof payload === 'string' && payload.length > 0) {
      return payload;
    }
    if (payload && typeof payload === 'object') {
      const msg = payload.message;
      if (Array.isArray(msg) && msg.length > 0) {
        return msg.join(' • ');
      }
      if (typeof msg === 'string' && msg.length > 0) {
        return msg;
      }
    }
    if (error.message) {
      return error.message;
    }
  }
  return fallback;
}
