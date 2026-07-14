import { describe, it, expect } from 'vitest';
import flattenActivityFundingSources from '#db/activity/flattenActivityFundingSources.js';
import mapActivity from '#db/activity/mapActivity.js';

describe('flattenActivityFundingSources', () => {
  it('returns blank slots for all 3 pairs when given no funding sources', () => {
    expect(flattenActivityFundingSources([])).toEqual({
      FundingSource1Name: '',
      FundingSource1Percentage: '',
      FundingSource2Name: '',
      FundingSource2Percentage: '',
      FundingSource3Name: '',
      FundingSource3Percentage: '',
    });
  });

  it('fills the first slot and leaves the rest blank when given one funding source', () => {
    expect(flattenActivityFundingSources([{ fundingSourceName: 'Federal Grant', percentage: 100 }])).toEqual({
      FundingSource1Name: 'Federal Grant',
      FundingSource1Percentage: 100,
      FundingSource2Name: '',
      FundingSource2Percentage: '',
      FundingSource3Name: '',
      FundingSource3Percentage: '',
    });
  });

  it('fills all 3 slots when given 3 funding sources', () => {
    expect(
      flattenActivityFundingSources([
        { fundingSourceName: 'Grant A', percentage: 25 },
        { fundingSourceName: 'Grant B', percentage: 25 },
        { fundingSourceName: 'Grant C', percentage: 50 },
      ]),
    ).toEqual({
      FundingSource1Name: 'Grant A',
      FundingSource1Percentage: 25,
      FundingSource2Name: 'Grant B',
      FundingSource2Percentage: 25,
      FundingSource3Name: 'Grant C',
      FundingSource3Percentage: 50,
    });
  });

  it('round-trips through mapActivity (read-side inverse)', () => {
    const fundingSources = [
      { fundingSourceName: 'Grant A', percentage: 25 },
      { fundingSourceName: 'Grant B', percentage: 75 },
    ];

    const flattened = flattenActivityFundingSources(fundingSources);
    const roundTripped = mapActivity(flattened).fundingSources;

    expect(roundTripped).toEqual(fundingSources);
  });
});
