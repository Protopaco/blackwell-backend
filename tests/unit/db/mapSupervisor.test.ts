import { describe, it, expect } from 'vitest';
import mapSupervisor from '#db/supervisor/mapSupervisor.js';

describe('mapSupervisor', () => {
  it('maps a full row to a Supervisor', () => {
    const supervisor = mapSupervisor({
      SupervisorId: 's1',
      SupervisorFirstName: 'Alex',
      SupervisorLastName: 'Rivera',
      SupervisorEmail: 'alex.rivera@example.org',
    });

    expect(supervisor).toEqual({
      supervisorId: 's1',
      supervisorFirstName: 'Alex',
      supervisorLastName: 'Rivera',
      supervisorEmail: 'alex.rivera@example.org',
    });
  });
});
