import { describe, it, expect, vi } from 'vitest';
import Activity from '#models/Activity.js';

vi.mock('#db/adapter/writeValues.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import writeActivitiesBulk from '#db/activity/writeActivitiesBulk.js';
import writeValues from '#db/adapter/writeValues.js';

const activity: Activity = {
  activityId: 'a1',
  activityName: 'Job Coaching',
  trackSeparately: false,
  payrollCategory: 'Regular',
  fundingSources: [{ fundingSourceName: 'Federal Grant', percentage: 100 }],
  payRate: 'HourlyPayRate1',
  flatRateAmount: 0,
};

describe('writeActivitiesBulk', () => {
  it('writes a header row plus one row per activity, flattening funding sources', async () => {
    await writeActivitiesBulk('report-1', [activity]);

    expect(writeValues).toHaveBeenCalledWith('report-1', 'Activities', [
      [
        'ActivityId', 'ActivityName', 'TrackSeparately', 'PayrollCategory',
        'FundingSource1Name', 'FundingSource1Percentage',
        'FundingSource2Name', 'FundingSource2Percentage',
        'FundingSource3Name', 'FundingSource3Percentage',
        'PayRate', 'FlatRateAmount',
      ],
      ['a1', 'Job Coaching', false, 'Regular', 'Federal Grant', 100, '', '', '', '', 'HourlyPayRate1', 0],
    ]);
  });

  it('still writes just the header row when there are no activities', async () => {
    await writeActivitiesBulk('report-1', []);

    expect(writeValues).toHaveBeenCalledWith('report-1', 'Activities', [
      [
        'ActivityId', 'ActivityName', 'TrackSeparately', 'PayrollCategory',
        'FundingSource1Name', 'FundingSource1Percentage',
        'FundingSource2Name', 'FundingSource2Percentage',
        'FundingSource3Name', 'FundingSource3Percentage',
        'PayRate', 'FlatRateAmount',
      ],
    ]);
  });
});
