import { describe, it, expect } from 'vitest';
import mapActivityRow from '#db/activity/mapActivityRow.js';
import Activity from '#models/Activity.js';

const activity: Activity = {
  activityId: 'a1',
  activityName: 'Job Coaching',
  payrollCategory: 'Regular',
  groupLabel: null,
  sortOrder: 0,
  fundingSources: [{ fundingSourceName: 'Federal Grant', percentage: 100 }],
};

describe('mapActivityRow', () => {
  it('maps an Activity to a row object, flattening funding sources into up to 3 name/percentage pairs', () => {
    expect(mapActivityRow(activity)).toEqual({
      ActivityId: 'a1',
      ActivityName: 'Job Coaching',
      PayrollCategory: 'Regular',
      GroupLabel: '',
      SortOrder: 0,
      FundingSource1Name: 'Federal Grant',
      FundingSource1Percentage: 100,
      FundingSource2Name: '',
      FundingSource2Percentage: '',
      FundingSource3Name: '',
      FundingSource3Percentage: '',
    });
  });
});
