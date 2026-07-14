import { describe, it, expect, vi } from 'vitest';
import applyFundingSourceRemainder from '#services/activity/applyFundingSourceRemainder.js';
import { logger } from '#utils/logger.js';

describe('applyFundingSourceRemainder', () => {
  it('returns an empty array unchanged', () => {
    expect(applyFundingSourceRemainder([])).toEqual([]);
  });

  it('forces a single funding source to 100%', () => {
    expect(applyFundingSourceRemainder([{ fundingSourceName: 'A', percentage: 40 }])).toEqual([
      { fundingSourceName: 'A', percentage: 100 },
    ]);
  });

  it('overwrites the last entry with the remainder of the others', () => {
    expect(
      applyFundingSourceRemainder([
        { fundingSourceName: 'A', percentage: 50 },
        { fundingSourceName: 'B', percentage: 999 },
      ]),
    ).toEqual([
      { fundingSourceName: 'A', percentage: 50 },
      { fundingSourceName: 'B', percentage: 50 },
    ]);
  });

  it('rounds the remainder to 2 decimal places to avoid floating-point drift', () => {
    const result = applyFundingSourceRemainder([
      { fundingSourceName: 'A', percentage: 33.33 },
      { fundingSourceName: 'B', percentage: 33.33 },
      { fundingSourceName: 'C', percentage: 0 },
    ]);

    expect(result[2].percentage).toBe(33.34);
  });

  it('throws UnprocessableError when the other entries alone already exceed 100%', () => {
    expect(() =>
      applyFundingSourceRemainder([
        { fundingSourceName: 'A', percentage: 70 },
        { fundingSourceName: 'B', percentage: 50 },
        { fundingSourceName: 'C', percentage: 0 },
      ]),
    ).toThrow('Funding source percentages cannot exceed 100%');
  });

  describe('remainder-mismatch warning', () => {
    it('logs a warning when the submitted last percentage does not match the computed remainder', () => {
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => undefined as any);

      applyFundingSourceRemainder([
        { fundingSourceName: 'A', percentage: 50 },
        { fundingSourceName: 'B', percentage: 999 },
      ]);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('does not match the computed remainder'));
      warnSpy.mockRestore();
    });

    it('does not log a warning when the submitted last percentage already matches the remainder', () => {
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => undefined as any);

      applyFundingSourceRemainder([
        { fundingSourceName: 'A', percentage: 50 },
        { fundingSourceName: 'B', percentage: 50 },
      ]);

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
