import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Bottleneck from 'bottleneck';
import scheduleGoogleApiCall from '#utils/rateLimiters/scheduleGoogleApiCall.js';

const rateLimitError = (): unknown => ({ code: 429, message: 'Quota exceeded' });
const otherError = (): unknown => ({ code: 500, message: 'Internal error' });

describe('scheduleGoogleApiCall', () => {
  let limiter: Bottleneck;

  beforeEach(() => {
    limiter = new Bottleneck();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves with the result on a first-try success, without any retry delay', async () => {
    const apiCall = vi.fn().mockResolvedValue('ok');

    const resultPromise = scheduleGoogleApiCall(limiter, apiCall);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toBe('ok');
    expect(apiCall).toHaveBeenCalledTimes(1);
  });

  it('rethrows a non-429 error immediately without retrying', async () => {
    const apiCall = vi.fn().mockRejectedValue(otherError());

    const resultPromise = scheduleGoogleApiCall(limiter, apiCall);
    const assertion = expect(resultPromise).rejects.toEqual(otherError());
    await vi.runAllTimersAsync();
    await assertion;
    expect(apiCall).toHaveBeenCalledTimes(1);
  });

  it('retries on 429 and succeeds once the underlying call recovers', async () => {
    const apiCall = vi.fn()
      .mockRejectedValueOnce(rateLimitError())
      .mockRejectedValueOnce(rateLimitError())
      .mockResolvedValueOnce('ok');

    const resultPromise = scheduleGoogleApiCall(limiter, apiCall);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toBe('ok');
    expect(apiCall).toHaveBeenCalledTimes(3);
  });

  it('gives up and throws the last 429 once retries are exhausted', async () => {
    const apiCall = vi.fn().mockRejectedValue(rateLimitError());

    const resultPromise = scheduleGoogleApiCall(limiter, apiCall);
    const assertion = expect(resultPromise).rejects.toEqual(rateLimitError());
    await vi.runAllTimersAsync();
    await assertion;

    // 1 initial attempt + RATE_LIMIT_RETRY_MAX_ATTEMPTS retries
    expect(apiCall).toHaveBeenCalledTimes(6);
  });

  it('backs off longer on each successive 429 retry', async () => {
    const apiCall = vi.fn()
      .mockRejectedValueOnce(rateLimitError())
      .mockRejectedValueOnce(rateLimitError())
      .mockResolvedValueOnce('ok');
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    const resultPromise = scheduleGoogleApiCall(limiter, apiCall);
    await vi.runAllTimersAsync();
    await resultPromise;

    // Filter out any incidental near-zero timers Bottleneck itself schedules internally — our own
    // backoff delays start at RATE_LIMIT_RETRY_BASE_DELAY_MS (1000ms), so anything smaller isn't ours.
    const backoffDelaysMs = setTimeoutSpy.mock.calls
      .map(([, delayMs]) => delayMs as number)
      .filter((delayMs) => delayMs >= 500);

    expect(backoffDelaysMs).toHaveLength(2);
    expect(backoffDelaysMs[1]).toBeGreaterThan(backoffDelaysMs[0]);
  });
});
