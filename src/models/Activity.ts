import Guid from '#models/Guid.js';
import { PayrollCategoryType } from './PayrollCategory.js';
import { PayRateType } from './PayRate.js';

interface ActivityFundingSource {
  fundingSourceName: string;
  percentage: number;
}

interface Activity {
  activityId: Guid;
  activityName: string;
  trackSeparately: boolean;
  payrollCategory: PayrollCategoryType;
  fundingSources: ActivityFundingSource[];  // max 3 — limit accepted for now
  payRate: PayRateType;
}

export type { ActivityFundingSource };
export default Activity;
