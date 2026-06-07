import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import Supervisor from '#models/Supervisor.js';

const mapToSupervisor = (row: Record<string, unknown>): Supervisor => ({
  supervisorId: row['SupervisorId'] as string,
  supervisorFirstName: row['SupervisorFirstName'] as string,
  supervisorLastName: row['SupervisorLastName'] as string,
  supervisorEmail: row['SupervisorEmail'] as string,
});

const readSupervisors = async (payrollConfigFileId: string): Promise<Supervisor[]> => {
  const rows = await sheetsAdapter.readTab(payrollConfigFileId, 'Supervisors');
  return rows.map(mapToSupervisor);
};

export default readSupervisors;
