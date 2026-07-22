import Bottleneck from 'bottleneck';
import { RATE_LIMIT_RETRY_MAX_ATTEMPTS, RATE_LIMIT_RETRY_BASE_DELAY_MS } from '#config/constants.js';
import { logger } from '#utils/logger.js';

const isRateLimitError = (error: unknown): boolean => {
  const { code, response } = (error ?? {}) as { code?: number; response?: { status?: number } };
  return code === 429 || response?.status === 429;
};

const delay = (ms: number): Promise<void> => new Promise((resolve) => { setTimeout(resolve, ms); });

// Schedules a Google API call through the given limiter. On a 429 (quota exceeded), backs off
// exponentially with jitter and reschedules the retry through the same limiter — unlike googleapis'
// own built-in gaxios retry, which retries silently inside a single scheduled call and is invisible to
// the limiter's reservoir accounting, every retry attempt made here consumes its own scheduled slot.
const scheduleGoogleApiCall = async <T>(
  limiter: Bottleneck,
  apiCall: () => Promise<T>,
  attempt = 0,
): Promise<T> => {
  try {
    return await limiter.schedule(apiCall);
  } catch (error) {
    if (!isRateLimitError(error) || attempt >= RATE_LIMIT_RETRY_MAX_ATTEMPTS) throw error;

    const backoffMs = RATE_LIMIT_RETRY_BASE_DELAY_MS * 2 ** attempt;
    const jitterMs = Math.random() * RATE_LIMIT_RETRY_BASE_DELAY_MS;
    logger.warn(
      `scheduleGoogleApiCall: 429 rate limited, retrying in ${Math.round(backoffMs + jitterMs)}ms `
      + `(attempt ${attempt + 1}/${RATE_LIMIT_RETRY_MAX_ATTEMPTS})`,
    );
    await delay(backoffMs + jitterMs);
    return scheduleGoogleApiCall(limiter, apiCall, attempt + 1);
  }
};

export default scheduleGoogleApiCall;
