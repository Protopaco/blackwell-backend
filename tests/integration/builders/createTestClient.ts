import request from 'supertest';
import app from '#app.js';
import ClientCreateRequest from '#models/ClientCreateRequest.js';
import Client from '#models/Client.js';
import { TimeInputMethod } from '#models/TimeInputMethod.js';
import { PayPeriodInterval } from '#models/PayPeriodInterval.js';
import buildDriveFolderLink from '../buildDriveFolderLink.js';
import getUniqueCode from '../helpers/getUniqueCode.js';
import createTestRootFolder from './createTestRootFolder.js';

const TEST_DATA_ROOT_FOLDER_ID = process.env.TEST_DATA_ROOT_FOLDER_ID;

// Creates a real client via the live API, anchored under TEST_DATA_ROOT_FOLDER_ID so sweep-teardown can
// find it. Returns the created Client. Throws on failure — this is setup for other scenarios, not the
// thing under test, so a failure here should fail loudly rather than be asserted on.
const createTestClient = async (overrides: Partial<ClientCreateRequest> = {}): Promise<Client> => {
  if (!TEST_DATA_ROOT_FOLDER_ID) {
    throw new Error('TEST_DATA_ROOT_FOLDER_ID is not set — required for all test data builders');
  }
  const rootFilderLinkFolderId = (await createTestRootFolder('createTestClient')).folderId;
  const uniqueClientCode = getUniqueCode('TEST');

  const requestBody: ClientCreateRequest = {
    clientName: `Test Client ${uniqueClientCode}`,
    clientCode: uniqueClientCode,
    employeePayrollFolder: {
      createNew: true,
      rootFolderLink: buildDriveFolderLink(rootFilderLinkFolderId),
    },
    settings: {
      timeInputMethod: TimeInputMethod.TotalHours,
      payPeriodInterval: PayPeriodInterval.BiWeekly,
      payPeriodStartDate: '2026-01-01',
    },
    ...overrides,
  };

  const response = await request(app).post('/api/v1/client').send(requestBody);

  if (response.status !== 201) {
    throw new Error(`createTestClient failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  return response.body as Client;
};

export default createTestClient;
