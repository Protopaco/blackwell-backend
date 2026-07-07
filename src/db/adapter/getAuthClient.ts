import { google } from 'googleapis';

// Builds a GoogleAuth client from the service account JSON env var — used by all service-account API calls.
const getAuthClient = () => {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  return new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });
};

export default getAuthClient;
