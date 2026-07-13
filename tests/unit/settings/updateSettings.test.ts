import { describe, it, expect, vi } from 'vitest';
import Settings from '#models/Settings.js';

const { testClient } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/settings/writeSettings.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import updateSettings from '#services/settings/updateSettings.js';
import getClientById from '#services/client/getClientById.js';
import writeSettings from '#db/settings/writeSettings.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

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

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(updateSettings('unknown-client', settings)).rejects.toThrow('Client not found: unknown-client');
  });
});
