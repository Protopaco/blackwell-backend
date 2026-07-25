import { describe, it, expect } from 'vitest';
import mapFundingSourceRow from '#db/fundingSource/mapFundingSourceRow.js';
import FundingSource from '#models/FundingSource.js';

describe('mapFundingSourceRow', () => {
  it('maps a FundingSource to a row object keyed by FUNDING_SOURCES_HEADERS', () => {
    const fundingSource: FundingSource = {
      fundingSourceId: 'fs1',
      fundingSourceName: 'Federal Grant',
      fundingSourceCode: 'FG-100',
    };

    expect(mapFundingSourceRow(fundingSource)).toEqual({
      FundingSourceId: 'fs1',
      FundingSourceName: 'Federal Grant',
      FundingSourceCode: 'FG-100',
    });
  });

  it('defaults FundingSourceCode to an empty string when not set', () => {
    const fundingSource: FundingSource = {
      fundingSourceId: 'fs2',
      fundingSourceName: 'State Grant',
    };

    expect(mapFundingSourceRow(fundingSource)).toEqual({
      FundingSourceId: 'fs2',
      FundingSourceName: 'State Grant',
      FundingSourceCode: '',
    });
  });
});
