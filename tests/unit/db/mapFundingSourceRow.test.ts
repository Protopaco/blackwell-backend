import { describe, it, expect } from 'vitest';
import mapFundingSourceRow from '#db/fundingSource/mapFundingSourceRow.js';
import FundingSource from '#models/FundingSource.js';

describe('mapFundingSourceRow', () => {
  it('maps a FundingSource to a row object keyed by FUNDING_SOURCES_HEADERS', () => {
    const fundingSource: FundingSource = {
      fundingSourceId: 'fs1',
      fundingSourceName: 'Federal Grant',
      fundingSourceCode: 'FG-100',
      fringeRate: 32,
    };

    expect(mapFundingSourceRow(fundingSource)).toEqual({
      FundingSourceId: 'fs1',
      FundingSourceName: 'Federal Grant',
      FundingSourceCode: 'FG-100',
      FringeRate: 32,
    });
  });

  it('defaults FundingSourceCode to an empty string when not set', () => {
    const fundingSource: FundingSource = {
      fundingSourceId: 'fs2',
      fundingSourceName: 'State Grant',
      fringeRate: null,
    };

    expect(mapFundingSourceRow(fundingSource)).toEqual({
      FundingSourceId: 'fs2',
      FundingSourceName: 'State Grant',
      FundingSourceCode: '',
      FringeRate: '',
    });
  });

  it('defaults FringeRate to an empty string when null', () => {
    const fundingSource: FundingSource = {
      fundingSourceId: 'fs3',
      fundingSourceName: 'General Operating',
      fundingSourceCode: 'GO',
      fringeRate: null,
    };

    expect(mapFundingSourceRow(fundingSource)).toEqual({
      FundingSourceId: 'fs3',
      FundingSourceName: 'General Operating',
      FundingSourceCode: 'GO',
      FringeRate: '',
    });
  });
});
