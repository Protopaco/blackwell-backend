import Bottleneck from 'bottleneck';
import {
  GOOGLE_API_RATE_LIMIT_PER_MINUTE,
  GOOGLE_API_RATE_LIMIT_REFILL_INTERVAL_MS,
} from '#config/constants.js';

// Paces all Google Sheets API calls (service account) so they queue instead of erroring past quota.
// Reservoir trickles back one token at a time instead of resetting to full every minute, so a depleted
// budget refills smoothly rather than releasing another 60-request burst all at once.
const sheetsLimiter = new Bottleneck({
  reservoir: GOOGLE_API_RATE_LIMIT_PER_MINUTE,
  reservoirIncreaseAmount: 1,
  reservoirIncreaseInterval: GOOGLE_API_RATE_LIMIT_REFILL_INTERVAL_MS,
  reservoirIncreaseMaximum: GOOGLE_API_RATE_LIMIT_PER_MINUTE,
  maxConcurrent: 1,
});

export default sheetsLimiter;
