import { describe, it, expect, vi } from 'vitest';

const { testClient } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/supervisor/appendSupervisor.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import createSupervisor from '#services/supervisor/createSupervisor.js';
import getClientById from '#services/client/getClientById.js';
import appendSupervisor from '#db/supervisor/appendSupervisor.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('createSupervisor', () => {
  it('appends the supervisor with a generated supervisorId and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { supervisors: [] } as any);

    await createSupervisor('client-1', {
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex.rivera@example.org',
    });

    expect(appendSupervisor).toHaveBeenCalledWith(
      'config-1',
      expect.objectContaining({
        firstName: 'Alex',
        lastName: 'Rivera',
        email: 'alex.rivera@example.org',
        supervisorId: expect.any(String),
      }),
    );
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(
      createSupervisor('unknown-client', {
        firstName: 'Alex',
        lastName: 'Rivera',
        email: 'alex.rivera@example.org',
      }),
    ).rejects.toThrow('Client not found: unknown-client');
  });
});
