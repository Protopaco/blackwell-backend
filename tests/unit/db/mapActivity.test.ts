import { describe, it, expect } from 'vitest';
import mapActivity from '#db/activity/mapActivity.js';

describe('mapActivity', () => {
  it('maps a full row to an Activity', () => {
    const activity = mapActivity({
      ActivityId: 'a1',
      ActivityName: 'Job Coaching',
      TrackSeparately: 'TRUE',
      PayrollCategory: 'Regular',
      PayRate: 'HourlyPayRate1',
      FundingSource1Name: 'Federal Grant',
      FundingSource1Percentage: '50',
    });

    expect(activity).toEqual({
      activityId: 'a1',
      activityName: 'Job Coaching',
      trackSeparately: true,
      payrollCategory: 'Regular',
      payRate: 'HourlyPayRate1',
      fundingSources: [{ fundingSourceName: 'Federal Grant', percentage: 50 }],
    });
  });

  describe('trackSeparately coercion', () => {
    it('treats boolean true as true', () => {
      expect(mapActivity({ TrackSeparately: true }).trackSeparately).toBe(true);
    });

    it('treats string "TRUE" as true', () => {
      expect(mapActivity({ TrackSeparately: 'TRUE' }).trackSeparately).toBe(true);
    });

    it('treats string "FALSE" as false', () => {
      expect(mapActivity({ TrackSeparately: 'FALSE' }).trackSeparately).toBe(false);
    });

    it('treats lowercase "true" as false — coercion is case-sensitive', () => {
      expect(mapActivity({ TrackSeparately: 'true' }).trackSeparately).toBe(false);
    });

    it('treats a missing value as false', () => {
      expect(mapActivity({}).trackSeparately).toBe(false);
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
