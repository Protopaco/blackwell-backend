import { describe, it, expect } from 'vitest';
import mapActivity from '#db/activity/mapActivity.js';

describe('mapActivity', () => {
  it('maps a full row to an Activity', () => {
    const activity = mapActivity({
      ActivityId: 'a1',
      ActivityName: 'Job Coaching',
      PayrollCategory: 'Regular',
      GroupLabel: 'VT Grows',
      SortOrder: '2',
      FundingSource1Name: 'Federal Grant',
      FundingSource1Percentage: '50',
    });

    expect(activity).toEqual({
      activityId: 'a1',
      activityName: 'Job Coaching',
      payrollCategory: 'Regular',
      groupLabel: 'VT Grows',
      sortOrder: 2,
      fundingSources: [{ fundingSourceName: 'Federal Grant', percentage: 50 }],
    });
  });

  describe('groupLabel/sortOrder coercion', () => {
    it('treats a missing GroupLabel as null', () => {
      expect(mapActivity({}).groupLabel).toBeNull();
    });

    it('treats an empty-string GroupLabel as null', () => {
      expect(mapActivity({ GroupLabel: '' }).groupLabel).toBeNull();
    });

    it('parses SortOrder as a number', () => {
      expect(mapActivity({ SortOrder: '3' }).sortOrder).toBe(3);
    });
  });

  describe('funding source extraction', () => {
    it('returns an empty array when no funding source names are present', () => {
      expect(mapActivity({}).fundingSources).toEqual([]);
    });

    it('extracts all three funding sources when present', () => {
      const activity = mapActivity({
        FundingSource1Name: 'Grant A',
        FundingSource1Percentage: '25',
        FundingSource2Name: 'Grant B',
        FundingSource2Percentage: '25',
        FundingSource3Name: 'Grant C',
        FundingSource3Percentage: '50',
      });

      expect(activity.fundingSources).toEqual([
        { fundingSourceName: 'Grant A', percentage: 25 },
        { fundingSourceName: 'Grant B', percentage: 25 },
        { fundingSourceName: 'Grant C', percentage: 50 },
      ]);
    });

    it('skips a gap in the middle rather than shifting later sources', () => {
      const activity = mapActivity({
        FundingSource1Name: 'Grant A',
        FundingSource1Percentage: '50',
        // FundingSource2Name intentionally absent
        FundingSource3Name: 'Grant C',
        FundingSource3Percentage: '50',
      });

      expect(activity.fundingSources).toEqual([
        { fundingSourceName: 'Grant A', percentage: 50 },
        { fundingSourceName: 'Grant C', percentage: 50 },
      ]);
    });
  });
});
