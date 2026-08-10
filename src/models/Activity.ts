import Guid from '#models/Guid.js';
import { PayrollCategoryType } from './PayrollCategory.js';

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
}

export type { ActivityFundingSource };
export default Activity;
