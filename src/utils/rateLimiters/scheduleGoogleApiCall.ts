import Bottleneck from 'bottleneck';
import { RATE_LIMIT_RETRY_MAX_ATTEMPTS, RATE_LIMIT_RETRY_BASE_DELAY_MS } from '#config/constants.js';
import { logger } from '#utils/logger.js';

// Status codes Google documents as worth retrying: 429 (quota exceeded) plus the transient
// server-side failures (500 internalError, 502, 503 backendError, 504). Anything else — 400, 403,
// 404 — reflects a real problem with the request and retrying it would just repeat the failure.
const RETRYABLE_HTTP_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

// Returns the HTTP status of a failed Google API call, or undefined if the error carries no status
// (a network-level failure, or something thrown from our own code).
const getHttpStatusCode = (error: unknown): number | undefined => {
  const { code, response } = (error ?? {}) as { code?: number; response?: { status?: number } };
  return response?.status ?? code;
};

const isRetryableGoogleApiError = (error: unknown): boolean => {
  const httpStatusCode = getHttpStatusCode(error);
  return httpStatusCode !== undefined && RETRYABLE_HTTP_STATUS_CODES.has(httpStatusCode);
};

const delay = (ms: number): Promise<void> => new Promise((resolve) => { setTimeout(resolve, ms); });

// Schedules a Google API call through the given limiter. On a retryable status (429 quota exceeded,
// or a transient 500/502/503/504), backs off exponentially with jitter and reschedules the retry
// through the same limiter — unlike googleapis' own built-in gaxios retry, which retries silently
// inside a single scheduled call and is invisible to the limiter's reservoir accounting, every retry
// attempt made here consumes its own scheduled slot.
const scheduleGoogleApiCall = async <T>(
  limiter: Bottleneck,
  apiCall: () => Promise<T>,
  attempt = 0,
): Promise<T> => {
  try {
    return await limiter.schedule(apiCall);
  } catch (error) {
    if (!isRetryableGoogleApiError(error) || attempt >= RATE_LIMIT_RETRY_MAX_ATTEMPTS) throw error;

    const backoffMs = RATE_LIMIT_RETRY_BASE_DELAY_MS * 2 ** attempt;
    const jitterMs = Math.random() * RATE_LIMIT_RETRY_BASE_DELAY_MS;
    logger.warn(
      `scheduleGoogleApiCall: ${getHttpStatusCode(error)} from Google API, retrying in `
      + `${Math.round(backoffMs + jitterMs)}ms (attempt ${attempt + 1}/${RATE_LIMIT_RETRY_MAX_ATTEMPTS})`,
    );
    await delay(backoffMs + jitterMs);
    return scheduleGoogleApiCall(limiter, apiCall, attempt + 1);
  }
};

export default scheduleGoogleApiCall;
