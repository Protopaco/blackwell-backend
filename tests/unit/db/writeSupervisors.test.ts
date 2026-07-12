import { describe, it, expect, vi } from 'vitest';
import Supervisor from '#models/Supervisor.js';

const { existingSupervisor } = vi.hoisted(() => ({
  existingSupervisor: {
    supervisorId: 's1',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex.rivera@example.org',
  } as Supervisor,
}));

vi.mock('#db/adapter/overwriteTabRows.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/supervisor/readSupervisors.js', () => ({ default: vi.fn().mockResolvedValue([existingSupervisor]) }));

import writeSupervisors from '#db/supervisor/writeSupervisors.js';
import overwriteTabRows from '#db/adapter/overwriteTabRows.js';

describe('writeSupervisors', () => {
  it('writes the updated supervisor in place of the matching existing record', async () => {
    await writeSupervisors('config-1', { ...existingSupervisor, lastName: 'Renamed' });

    expect(overwriteTabRows).toHaveBeenCalledWith(
      'config-1',
      'Supervisors',
      ['SupervisorId', 'FirstName', 'LastName', 'Email'],
      [{ SupervisorId: 's1', FirstName: 'Alex', LastName: 'Renamed', Email: 'alex.rivera@example.org' }],
    );
  });

  it('throws NotFoundError when the supervisorId does not match any existing supervisor', async () => {
    await expect(
      writeSupervisors('config-1', {
        supervisorId: 'unknown',
        firstName: 'X',
        lastName: 'Y',
        email: 'x@example.org',
      }),
    ).rejects.toThrow('Supervisor not found: unknown');
  });
});
