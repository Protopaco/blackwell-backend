import { describe, it, expect } from 'vitest';
import mapSupervisor from '#db/supervisor/mapSupervisor.js';

describe('mapSupervisor', () => {
  it('maps a full row to a Supervisor', () => {
    const supervisor = mapSupervisor({
      SupervisorId: 's1',
      FirstName: 'Alex',
      LastName: 'Rivera',
      Email: 'alex.rivera@example.org',
    });

    expect(supervisor).toEqual({
      supervisorId: 's1',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex.rivera@example.org',
    });
  });
});
