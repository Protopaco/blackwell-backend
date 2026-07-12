import appendRow from '#db/adapter/appendRow.js';
import { SUPERVISORS_TAB } from '#config/constants.js';
import Supervisor from '#models/Supervisor.js';

// Appends a new supervisor row to the Supervisors tab.
const appendSupervisor = async (payrollConfigFileId: string, supervisor: Supervisor): Promise<void> => {
  const row: Record<string, unknown> = {
    SupervisorId: supervisor.supervisorId,
    FirstName: supervisor.firstName,
    LastName: supervisor.lastName,
    Email: supervisor.email,
  };

  await appendRow(payrollConfigFileId, SUPERVISORS_TAB, row);
};

export default appendSupervisor;
