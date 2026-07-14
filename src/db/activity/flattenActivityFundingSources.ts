import { ActivityFundingSource } from '#models/Activity.js';

// Flattens an activity's funding sources into up to 3 FundingSource{N}Name/FundingSource{N}Percentage
// column pairs — the write-side inverse of mapFundingSources in mapActivity.ts. Unused slots are blank.
const flattenActivityFundingSources = (fundingSources: ActivityFundingSource[]): Record<string, unknown> => {
  const row: Record<string, unknown> = {};

  for (let i = 1; i <= 3; i++) {
    const fundingSource = fundingSources[i - 1];
    row[`FundingSource${i}Name`] = fundingSource?.fundingSourceName ?? '';
    row[`FundingSource${i}Percentage`] = fundingSource?.percentage ?? '';
  }

  return row;
};

export default flattenActivityFundingSources;
