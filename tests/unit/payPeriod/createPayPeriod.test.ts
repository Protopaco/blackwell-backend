import { describe, it, expect, vi, beforeEach } from 'vitest';
import Client from '#models/Client.js';
import PayPeriod from '#models/PayPeriod.js';

const { client, nextPayPeriod } = vi.hoisted(() => ({
  client: {
    clientId: 'c1',
    clientName: 'Acme Co',
    clientCode: 'ACME',
    status: 'Active',
    employeePayrollFolderId: 'epf-1',
    payrollConfigFolderId: 'pcf-1',
    payrollReportFolderId: 'prf-1',
    payrollConfigFileId: 'config-1',
    payPeriodRegistryFileId: 'registry-1',
  } as Client,
  nextPayPeriod: {
    payPeriodId: '',
    payPeriodName: '06/01 - 06/14',
    status: 'Pending',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
    createdDate: '',
    payrollReportFileId: '',
  } as PayPeriod,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(client) }));
vi.mock('#services/payPeriod/getNextPayPeriod.js', () => ({ default: vi.fn().mockResolvedValue(nextPayPeriod) }));
vi.mock('#services/payPeriod/createPayPeriodConfigSnapshot.js', () => ({ default: vi.fn().mockResolvedValue('report-1') }));
vi.mock('#db/payPeriod/appendPayPeriod.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import createPayPeriod from '#services/payPeriod/createPayPeriod.js';
import getClientById from '#services/client/getClientById.js';
import createPayPeriodConfigSnapshot from '#services/payPeriod/createPayPeriodConfigSnapshot.js';
import appendPayPeriod from '#db/payPeriod/appendPayPeriod.js';

describe('createPayPeriod', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientById).mockResolvedValue(client);
    vi.mocked(createPayPeriodConfigSnapshot).mockResolvedValue('report-1');
  });

  it('builds the config snapshot before appending, passing the client and the new pay period', async () => {
    await createPayPeriod('c1');

    expect(createPayPeriodConfigSnapshot).toHaveBeenCalledWith(
      client,
      expect.objectContaining({ payPeriodName: '06/01 - 06/14' }),
    );
  });

  it('appends the pay period with payrollReportFileId already set from the snapshot', async () => {
    await createPayPeriod('c1');

    expect(appendPayPeriod).toHaveBeenCalledWith(
      'registry-1',
      expect.objectContaining({ payrollReportFileId: 'report-1' }),
    );
  });

  it('assigns a new payPeriodId and createdDate before building the snapshot', async () => {
    await createPayPeriod('c1');

    const [, newPayPeriod] = vi.mocked(createPayPeriodConfigSnapshot).mock.calls[0];
    expect(newPayPeriod.payPeriodId).toEqual(expect.any(String));
    expect(newPayPeriod.payPeriodId).not.toBe('');
    expect(newPayPeriod.createdDate).not.toBe('');
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(createPayPeriod('unknown')).rejects.toThrow('Client not found: unknown');

    expect(createPayPeriodConfigSnapshot).not.toHaveBeenCalled();
    expect(appendPayPeriod).not.toHaveBeenCalled();
  });
});
