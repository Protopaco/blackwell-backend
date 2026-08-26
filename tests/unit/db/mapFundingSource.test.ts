import { describe, it, expect } from 'vitest';
import mapFundingSource from '#db/fundingSource/mapFundingSource.js';

describe('mapFundingSource', () => {
  it('maps a full row to a FundingSource', () => {
    const fundingSource = mapFundingSource({
      FundingSourceId: 'f1',
      FundingSourceName: 'Federal Grant',
      FundingSourceCode: 'FG-100',
      FringeRate: 32,
    });

    expect(fundingSource).toEqual({
      fundingSourceId: 'f1',
      fundingSourceName: 'Federal Grant',
      fundingSourceCode: 'FG-100',
      fringeRate: 32,
    });
  });

  describe('optional fundingSourceCode', () => {
    it('keeps a present code', () => {
      expect(mapFundingSource({ FundingSourceCode: 'FG-100' }).fundingSourceCode).toBe('FG-100');
    });

    it('converts an empty string to undefined', () => {
      expect(mapFundingSource({ FundingSourceCode: '' }).fundingSourceCode).toBeUndefined();
    });

    it('converts a missing value to undefined', () => {
      expect(mapFundingSource({}).fundingSourceCode).toBeUndefined();
    });
  });

  describe('nullable fringeRate', () => {
    it('keeps a present rate', () => {
      expect(mapFundingSource({ FringeRate: 32 }).fringeRate).toBe(32);
    });

    it('converts an empty string to null', () => {
      expect(mapFundingSource({ FringeRate: '' }).fringeRate).toBeNull();
    });

    it('converts a missing value to null', () => {
      expect(mapFundingSource({}).fringeRate).toBeNull();
    });
  });
});
