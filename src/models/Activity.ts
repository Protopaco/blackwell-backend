import Guid from '#models/Guid.js';
import { PayrollCategoryType } from './PayrollCategory.js';

interface ActivityFundingSource {
  fundingSourceName: string;
  percentage: number;
}

interface Activity {
  activityId: Guid;
  activityName: string;
  payrollCategory: PayrollCategoryType;
  groupLabel: string | null;
  sortOrder: number;
  fundingSources: ActivityFundingSource[];  // max 3 — limit accepted for now
}

export type { ActivityFundingSource };
export default Activity;
