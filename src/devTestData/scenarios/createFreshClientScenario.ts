import createFolder from '#db/adapter/createFolder.js';
import { PayPeriodInterval } from '#models/PayPeriodInterval.js';
import { TimeInputMethod } from '#models/TimeInputMethod.js';
import createClient from '#services/client/createClient.js';
import buildDriveFolderLink from '#utils/buildDriveFolderLink.js';

const createFreshClientScenario = async (rootFolderId: string): Promise<void> => {
  const scenarioFolderId = await createFolder('Fresh Client', rootFolderId);

  await createClient({
    clientName: 'UI Test Fresh Client',
    clientCode: 'UI_TEST_FC',
    employeePayrollFolder: {
      createNew: true,
      rootFolderLink: buildDriveFolderLink(scenarioFolderId),
    },
    settings: {
      timeInputMethod: TimeInputMethod.TotalHours,
      payPeriodInterval: PayPeriodInterval.BiWeekly,
      payPeriodStartDate: '2026-01-01',
    },
  });
};

export default createFreshClientScenario;
