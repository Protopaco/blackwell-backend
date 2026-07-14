import { describe, it, expect, vi } from 'vitest';
import Supervisor from '#models/Supervisor.js';

const { testClient } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/supervisor/writeSupervisors.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import updateSupervisor from '#services/supervisor/updateSupervisor.js';
import getClientById from '#services/client/getClientById.js';
import writeSupervisors from '#db/supervisor/writeSupervisors.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

const supervisor: Supervisor = {
  supervisorId: 's1',
  firstName: 'Alex',
  lastName: 'Rivera',
  email: 'alex.rivera@example.org',
};

describe('updateSupervisor', () => {
  it('writes the updated supervisor and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { supervisors: [] } as any);

    await updateSupervisor('client-1', supervisor);

    expect(writeSupervisors).toHaveBeenCalledWith('config-1', supervisor);
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(updateSupervisor('unknown-client', supervisor)).rejects.toThrow(
      'Client not found: unknown-client',
    );
  });
});
