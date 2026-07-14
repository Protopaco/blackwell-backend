import Activity, { ActivityFundingSource } from '#models/Activity.js';
import { PayrollCategoryType } from '#models/PayrollCategory.js';
import { PayRateType } from '#models/PayRate.js';

// Extracts up to three funding source allocations from a row's FundingSource1-3 columns.
const mapFundingSources = (row: Record<string, unknown>): ActivityFundingSource[] => {
  const fundingSources: ActivityFundingSource[] = [];
  for (let i = 1; i <= 3; i++) {
    const name = row[`FundingSource${i}Name`] as string;
    const percentage = Number(row[`FundingSource${i}Percentage`]);
    if (name) fundingSources.push({ fundingSourceName: name, percentage });
  }
  return fundingSources;
};

// Converts a raw Activities sheet row into an Activity model — called by readPayrollConfig and readActivities.
const mapActivity = (row: Record<string, unknown>): Activity => ({
  activityId: row['ActivityId'] as string,
  activityName: row['ActivityName'] as string,
  trackSeparately: row['TrackSeparately'] === true || row['TrackSeparately'] === 'TRUE',
  payrollCategory: row['PayrollCategory'] as PayrollCategoryType,
  fundingSources: mapFundingSources(row),
  payRate: row['PayRate'] as PayRateType,
  flatRateAmount: Number(row['FlatRateAmount']) || 0,
});

export default mapActivity;
