import { describe, it, expect } from 'vitest';
import validateActivityFundingSources from '#services/activity/validateActivityFundingSources.js';

describe('validateActivityFundingSources', () => {
  it('allows activity funding sources that exist in the client config', () => {
    expect(() =>
      validateActivityFundingSources(
        [
          { fundingSourceName: 'Federal Grant', percentage: 60 },
          { fundingSourceName: 'State Grant', percentage: 40 },
        ],
        [
          { fundingSourceId: 'fs-1', fundingSourceName: 'Federal Grant', fundingSourceCode: 'FED' },
          { fundingSourceId: 'fs-2', fundingSourceName: 'State Grant', fundingSourceCode: 'STATE' },
        ],
      ),
    ).not.toThrow();
  });

  it('throws UnprocessableError when one activity funding source is not configured', () => {
    expect(() =>
      validateActivityFundingSources(
        [{ fundingSourceName: 'Unknown Grant', percentage: 100 }],
        [{ fundingSourceId: 'fs-1', fundingSourceName: 'Federal Grant', fundingSourceCode: 'FED' }],
      ),
    ).toThrow('Activity funding source not found: Unknown Grant');
  });

  it('includes every missing funding source name in the error message', () => {
    expect(() =>
      validateActivityFundingSources(
        [
          { fundingSourceName: 'Unknown Grant A', percentage: 50 },
          { fundingSourceName: 'Unknown Grant B', percentage: 50 },
        ],
        [{ fundingSourceId: 'fs-1', fundingSourceName: 'Federal Grant', fundingSourceCode: 'FED' }],
      ),
    ).toThrow('Activity funding source not found: Unknown Grant A, Unknown Grant B');
  });
});
