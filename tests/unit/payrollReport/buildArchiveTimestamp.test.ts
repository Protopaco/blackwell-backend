import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import buildArchiveTimestamp from '#services/payrollReport/buildArchiveTimestamp.js';

describe('buildArchiveTimestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('zero-pads single-digit month, day, hour, and minute', () => {
    vi.setSystemTime(new Date(2026, 0, 5, 9, 5)); // Jan 5, 2026, 9:05am — local time
    expect(buildArchiveTimestamp()).toBe('0105_0905');
  });

  it('leaves double-digit values unchanged', () => {
    vi.setSystemTime(new Date(2026, 11, 25, 14, 30)); // Dec 25, 2026, 2:30pm — local time
    expect(buildArchiveTimestamp()).toBe('1225_1430');
  });

  it('pads midnight hour correctly', () => {
    vi.setSystemTime(new Date(2026, 5, 1, 0, 0)); // Jun 1, 2026, 12:00am — local time
    expect(buildArchiveTimestamp()).toBe('0601_0000');
  });
});
