import { google } from 'googleapis';

// Returns a Google Drive API client authenticated as a real user via OAuth — required so new files
// are owned by the user rather than the service account, making them visible in their Google Drive.
const getOAuthDriveClient = () => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN must be set');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  // retry: false — retries on 429 are handled by scheduleGoogleApiCall instead, so each retry attempt
  // goes through the rate limiter and is accounted for, rather than firing silently inside gaxios.
  return google.drive({ version: 'v3', auth: oauth2Client, retry: false });
};

export default getOAuthDriveClient;
