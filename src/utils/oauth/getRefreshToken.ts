import dotenv from 'dotenv';
dotenv.config();

import { google } from 'googleapis';
import * as readline from 'readline';

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error('GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set in .env');
}

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  'urn:ietf:wg:oauth:2.0:oob', // desktop app redirect — shows code in browser
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
  ],
  prompt: 'consent', // forces refresh token to be returned even if previously authorized
});

console.log('\nOpen this URL in your browser and authorize the application:\n');
console.log(authUrl);
console.log('\nAfter authorizing, paste the code shown in the browser below:\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Authorization code: ', async (code) => {
  rl.close();
  const { tokens } = await oauth2Client.getToken(code.trim());

  console.log('\nAdd this to your .env file:\n');
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`);
});
