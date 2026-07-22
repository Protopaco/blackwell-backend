import { ActivityFundingSource } from '#models/Activity.js';
import FundingSource from '#models/FundingSource.js';
import { UnprocessableError } from '#utils/errors.js';

const validateActivityFundingSources = (
  activityFundingSources: ActivityFundingSource[],
  fundingSources: FundingSource[],
): void => {
  const configuredFundingSourceNames = new Set(
    fundingSources.map((fundingSource) => fundingSource.fundingSourceName),
  );
  const missingFundingSourceNames = activityFundingSources
    .map((fundingSource) => fundingSource.fundingSourceName)
    .filter((fundingSourceName) => !configuredFundingSourceNames.has(fundingSourceName));

  if (missingFundingSourceNames.length > 0) {
    throw new UnprocessableError(
      `Activity funding source not found: ${missingFundingSourceNames.join(', ')}`,
    );
  }
};

export default validateActivityFundingSources;
