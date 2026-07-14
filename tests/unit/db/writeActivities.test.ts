import { describe, it, expect, vi } from 'vitest';
import Activity from '#models/Activity.js';

const { existingActivity } = vi.hoisted(() => ({
  existingActivity: {
    activityId: 'a1',
    activityName: 'Job Coaching',
    trackSeparately: false,
    payrollCategory: 'Regular',
    fundingSources: [{ fundingSourceName: 'Federal Grant', percentage: 100 }],
    payRate: 'HourlyPayRate1',
    flatRateAmount: 0,
  } as Activity,
}));

vi.mock('#db/adapter/overwriteTabRows.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/activity/readActivities.js', () => ({ default: vi.fn().mockResolvedValue([existingActivity]) }));

import writeActivities from '#db/activity/writeActivities.js';
import overwriteTabRows from '#db/adapter/overwriteTabRows.js';

describe('writeActivities', () => {
  it('writes the updated activity in place of the matching existing record, flattening funding sources', async () => {
    await writeActivities('config-1', { ...existingActivity, activityName: 'Renamed Activity' });

    expect(overwriteTabRows).toHaveBeenCalledWith(
      'config-1',
      'Activities',
      [
        'ActivityId', 'ActivityName', 'TrackSeparately', 'PayrollCategory',
        'FundingSource1Name', 'FundingSource1Percentage',
        'FundingSource2Name', 'FundingSource2Percentage',
        'FundingSource3Name', 'FundingSource3Percentage',
        'PayRate', 'FlatRateAmount',
      ],
      [
        {
          ActivityId: 'a1',
          ActivityName: 'Renamed Activity',
          TrackSeparately: false,
          PayrollCategory: 'Regular',
          FundingSource1Name: 'Federal Grant',
          FundingSource1Percentage: 100,
          FundingSource2Name: '',
          FundingSource2Percentage: '',
          FundingSource3Name: '',
          FundingSource3Percentage: '',
          PayRate: 'HourlyPayRate1',
          FlatRateAmount: 0,
        },
      ],
    );
  });

  it('throws NotFoundError when the activityId does not match any existing activity', async () => {
    await expect(
      writeActivities('config-1', { ...existingActivity, activityId: 'unknown' }),
    ).rejects.toThrow('Activity not found: unknown');
  });
});
