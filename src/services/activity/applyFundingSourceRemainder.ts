import { ActivityFundingSource } from '#models/Activity.js';
import { UnprocessableError } from '#utils/errors.js';
import { logger } from '#utils/logger.js';

// Forces an activity's funding source percentages to sum to exactly 100 by overwriting the last entry
// with the remainder — avoids requiring the caller's values to already sum to exactly 100 (which is
// prone to floating-point drift), while still rejecting inputs where the other entries alone exceed 100%.
// Logs a warning if the submitted last-entry percentage doesn't match the computed remainder — the
// frontend is expected to already calculate this correctly, so a mismatch signals it's drifted out of sync.
const applyFundingSourceRemainder = (
  fundingSources: ActivityFundingSource[],
): ActivityFundingSource[] => {
  if (fundingSources.length === 0) return fundingSources;

  const allButLast = fundingSources.slice(0, -1);
  const last = fundingSources[fundingSources.length - 1];

  const sumOfOthers = Math.round(
    allButLast.reduce((sum, fundingSource) => sum + fundingSource.percentage, 0) * 100,
  ) / 100;
  const remainder = Math.round((100 - sumOfOthers) * 100) / 100;

  if (remainder < 0) {
    throw new UnprocessableError('Funding source percentages cannot exceed 100%');
  }

  const submittedLastPercentage = Math.round(last.percentage * 100) / 100;
  if (submittedLastPercentage !== remainder) {
    logger.warn(
      `applyFundingSourceRemainder: submitted last funding source percentage (${submittedLastPercentage}) for "${last.fundingSourceName}" does not match the computed remainder (${remainder})`,
    );
  }

  return [...allButLast, { ...last, percentage: remainder }];
};

export default applyFundingSourceRemainder;
