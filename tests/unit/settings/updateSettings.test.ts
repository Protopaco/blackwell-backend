import { describe, it, expect, vi } from 'vitest';
import Settings from '#models/Settings.js';
import PayPeriod from '#models/PayPeriod.js';

const { testClient, testPayPeriods } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1', payPeriodRegistryFileId: 'registry-1' } as any,
  testPayPeriods: [
    { payrollReportFileId: 'report-1' } as PayPeriod,
    { payrollReportFileId: 'report-2' } as PayPeriod,
    { payrollReportFileId: '' } as PayPeriod, // no report generated yet for this pay period
  ],
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/settings/writeSettings.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/payPeriod/readPayPeriods.js', () => ({ default: vi.fn().mockResolvedValue(testPayPeriods) }));

import updateSettings from '#services/settings/updateSettings.js';
import getClientById from '#services/client/getClientById.js';
import writeSettings from '#db/settings/writeSettings.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';

const settings: Settings = {
  timeInputMethod: 'TotalHours',
  payPeriodInterval: 'Bi-Weekly',
  payPeriodStartDate: '2026-01-05',
};

describe('updateSettings', () => {
  it('writes the settings and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { settings } as any);

    await updateSettings('client-1', settings);

    expect(writeSettings).toHaveBeenCalledWith('config-1', settings);
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('invalidates every one of the client\'s pay periods\' cached config snapshots, since settings are client-wide', async () => {
    payPeriodConfigSnapshotCache.set('report-1', { settings } as any);
    payPeriodConfigSnapshotCache.set('report-2', { settings } as any);

    await updateSettings('client-1', settings);

    expect(payPeriodConfigSnapshotCache.get('report-1')).toBeNull();
    expect(payPeriodConfigSnapshotCache.get('report-2')).toBeNull();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(updateSettings('unknown-client', settings)).rejects.toThrow('Client not found: unknown-client');
  });
});
