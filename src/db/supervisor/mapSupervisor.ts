import Supervisor from '#models/Supervisor.js';

// Converts a raw Supervisors sheet row into a Supervisor model.
const mapSupervisor = (row: Record<string, unknown>): Supervisor => ({
  supervisorId: row['SupervisorId'] as string,
  supervisorFirstName: row['SupervisorFirstName'] as string,
  supervisorLastName: row['SupervisorLastName'] as string,
  supervisorEmail: row['SupervisorEmail'] as string,
});

export default mapSupervisor;
