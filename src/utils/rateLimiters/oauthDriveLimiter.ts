import Bottleneck from 'bottleneck';
import { GOOGLE_API_RATE_LIMIT_PER_MINUTE, GOOGLE_API_RATE_LIMIT_WINDOW_MS } from '#config/constants.js';

// Paces all Google Drive API calls made as the OAuth user so they queue instead of erroring past quota.
const oauthDriveLimiter = new Bottleneck({
  reservoir: GOOGLE_API_RATE_LIMIT_PER_MINUTE,
  reservoirRefreshAmount: GOOGLE_API_RATE_LIMIT_PER_MINUTE,
  reservoirRefreshInterval: GOOGLE_API_RATE_LIMIT_WINDOW_MS,
  maxConcurrent: 1,
});

export default oauthDriveLimiter;
