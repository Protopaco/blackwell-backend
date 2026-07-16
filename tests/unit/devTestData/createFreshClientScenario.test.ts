import { describe, expect, it, vi } from 'vitest';
import { PayPeriodInterval } from '#models/PayPeriodInterval.js';
import { TimeInputMethod } from '#models/TimeInputMethod.js';

vi.mock('#db/adapter/createFolder.js', () => ({ default: vi.fn().mockResolvedValue('scenario-folder-1') }));
vi.mock('#services/client/createClient.js', () => ({ default: vi.fn().mockResolvedValue({}) }));

import createFolder from '#db/adapter/createFolder.js';
import createClient from '#services/client/createClient.js';
import createFreshClientScenario from '#devTestData/scenarios/createFreshClientScenario.js';

describe('createFreshClientScenario', () => {
  it('creates a fresh UI test client under its scenario folder', async () => {
    await createFreshClientScenario('ui-test-root-1');

    expect(createFolder).toHaveBeenCalledWith('Fresh Client', 'ui-test-root-1');
    expect(createClient).toHaveBeenCalledWith({
      clientName: 'UI Test Fresh Client',
      clientCode: 'UI_TEST_FC',
      employeePayrollFolder: {
        createNew: true,
        rootFolderLink: 'https://drive.google.com/drive/folders/scenario-folder-1',
      },
      settings: {
        timeInputMethod: TimeInputMethod.TotalHours,
        payPeriodInterval: PayPeriodInterval.BiWeekly,
        payPeriodStartDate: '2026-01-01',
      },
    });
  });
});
