import { describe, it, expect, vi, beforeEach } from 'vitest';

const { baseRequest } = vi.hoisted(() => ({
  baseRequest: {
    clientName: 'Acme Co',
    clientCode: 'ACME',
    employeePayrollFolder: { link: 'https://drive.google.com/drive/folders/epf-1' },
    settings: {
      timeInputMethod: 'ClockInOut',
      payPeriodInterval: 'Bi-Weekly',
      payPeriodStartDate: '2026-01-05',
    },
  } as any,
}));

vi.mock('#services/client/resolveFolder.js', () => ({ default: vi.fn() }));
vi.mock('#db/adapter/driveChildExists.js', () => ({ default: vi.fn().mockResolvedValue(false) }));
vi.mock('#db/adapter/createOAuthWorkbook.js', () => ({ default: vi.fn() }));
vi.mock('#db/adapter/createTabIfNotExists.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/writeHeaderRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/settings/writeSettings.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/client/appendClient.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/client/readClients.js', () => ({ default: vi.fn().mockResolvedValue([]) }));

import createClient from '#services/client/createClient.js';
import resolveFolder from '#services/client/resolveFolder.js';
import driveChildExists from '#db/adapter/driveChildExists.js';
import createOAuthWorkbook from '#db/adapter/createOAuthWorkbook.js';
import createTabIfNotExists from '#db/adapter/createTabIfNotExists.js';
import writeHeaderRow from '#db/adapter/writeHeaderRow.js';
import appendClient from '#db/client/appendClient.js';
import readClients from '#db/client/readClients.js';
import clientsCache from '#utils/caches/clientsCache.js';
import { PAY_PERIOD_HEADERS } from '#config/constants.js';

describe('createClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLIENT_CONFIG_FILE_ID = 'client-config-1';
    vi.mocked(readClients).mockResolvedValue([]);
    vi.mocked(driveChildExists).mockResolvedValue(false);
    vi.mocked(resolveFolder)
      .mockResolvedValueOnce('employee-payroll-1')
      .mockResolvedValueOnce('payroll-config-1')
      .mockResolvedValueOnce('payroll-report-1');
    vi.mocked(createOAuthWorkbook)
      .mockResolvedValueOnce('payroll-config-file-1')
      .mockResolvedValueOnce('pay-period-registry-1');
  });

  it('provisions a client end to end and returns it', async () => {
    const client = await createClient(baseRequest);

    expect(client).toMatchObject({
      clientName: 'Acme Co',
      clientCode: 'ACME',
      status: 'Active',
      employeePayrollFolderId: 'employee-payroll-1',
      payrollConfigFolderId: 'payroll-config-1',
      payrollReportFolderId: 'payroll-report-1',
      payrollConfigFileId: 'payroll-config-file-1',
      payPeriodRegistryFileId: 'pay-period-registry-1',
    });
    expect(client.clientId).toEqual(expect.any(String));

    expect(createOAuthWorkbook).toHaveBeenNthCalledWith(1, 'ACME Payroll Config', 'payroll-config-1');
    expect(createOAuthWorkbook).toHaveBeenNthCalledWith(2, 'ACME Pay Period Registry', 'payroll-config-1');
    expect(createTabIfNotExists).toHaveBeenCalledTimes(8);
    expect(createTabIfNotExists).toHaveBeenCalledWith('pay-period-registry-1', String(new Date().getFullYear()));
    expect(writeHeaderRow).toHaveBeenCalledWith(
      'pay-period-registry-1',
      String(new Date().getFullYear()),
      PAY_PERIOD_HEADERS,
    );
    expect(appendClient).toHaveBeenCalledWith('client-config-1', client);
  });

  it('invalidates clientsCache after a successful create', async () => {
    clientsCache.set('client-config-1', [{ clientId: 'stale' } as any]);

    await createClient(baseRequest);

    expect(clientsCache.get('client-config-1')).toBeNull();
  });

  it('throws UnprocessableError when creating a new Employee Payroll folder without a root link', async () => {
    await expect(
      createClient({ ...baseRequest, employeePayrollFolder: { createNew: true } }),
    ).rejects.toThrow('rootFolderLink is required');

    expect(resolveFolder).not.toHaveBeenCalled();
  });

  it('throws UnprocessableError when clientCode already exists, without provisioning anything', async () => {
    vi.mocked(readClients).mockResolvedValueOnce([
      { clientId: 'existing-client', clientCode: 'ACME' } as any,
    ]);

    await expect(createClient(baseRequest)).rejects.toThrow('Client code already exists: ACME');

    expect(resolveFolder).not.toHaveBeenCalled();
    expect(createOAuthWorkbook).not.toHaveBeenCalled();
    expect(appendClient).not.toHaveBeenCalled();
  });

  it('throws UnprocessableError on a Payroll Config file name collision, without creating anything', async () => {
    vi.mocked(driveChildExists).mockResolvedValueOnce(true);

    await expect(createClient(baseRequest)).rejects.toThrow('already exists in the Payroll Config folder');

    expect(createOAuthWorkbook).not.toHaveBeenCalled();
  });

  it('throws UnprocessableError on a PayPeriod Registry file name collision, without creating a second file', async () => {
    vi.mocked(driveChildExists).mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    await expect(createClient(baseRequest)).rejects.toThrow('already exists in the Payroll Config folder');

    expect(createOAuthWorkbook).toHaveBeenCalledTimes(1);
    expect(appendClient).not.toHaveBeenCalled();
  });
});
