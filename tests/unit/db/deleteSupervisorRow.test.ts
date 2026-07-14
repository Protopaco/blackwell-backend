import { describe, it, expect, vi } from 'vitest';

vi.mock('#db/adapter/readTab.js', () => ({
  default: vi.fn().mockResolvedValue([
    { SupervisorId: 's1', FirstName: 'Alex', LastName: 'Rivera', Email: 'alex.rivera@example.org' },
    { SupervisorId: 's2', FirstName: 'Jordan', LastName: 'Lee', Email: 'jordan.lee@example.org' },
  ]),
}));
vi.mock('#db/adapter/deleteRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import deleteSupervisorRow from '#db/supervisor/deleteSupervisorRow.js';
import deleteRow from '#db/adapter/deleteRow.js';

describe('deleteSupervisorRow', () => {
  it('deletes the sheet row matching the given supervisorId, accounting for the header row', async () => {
    await deleteSupervisorRow('config-1', 's2');

    // s2 is the second data row (index 1) -> sheet row 3 (1 header row + 1-based index)
    expect(deleteRow).toHaveBeenCalledWith('config-1', 'Supervisors', 3);
  });

  it('throws NotFoundError when the supervisorId does not match any row', async () => {
    await expect(deleteSupervisorRow('config-1', 'unknown')).rejects.toThrow('Supervisor not found: unknown');
  });
});
