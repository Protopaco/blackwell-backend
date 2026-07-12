import overwriteTabRows from '#db/adapter/overwriteTabRows.js';
import readSupervisors from '#db/supervisor/readSupervisors.js';
import { SUPERVISORS_TAB, SUPERVISORS_HEADERS } from '#config/constants.js';
import Supervisor from '#models/Supervisor.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites all supervisor rows, updating the one matching the given supervisor.
const writeSupervisors = async (
  payrollConfigFileId: string,
  updatedSupervisor: Supervisor,
): Promise<void> => {
  const supervisors = await readSupervisors(payrollConfigFileId);

  const index = supervisors.findIndex(
    (supervisor) => supervisor.supervisorId === updatedSupervisor.supervisorId,
  );
  if (index === -1) throw new NotFoundError(`Supervisor not found: ${updatedSupervisor.supervisorId}`);

  supervisors[index] = updatedSupervisor;

  const rows = supervisors.map((supervisor) => ({
    SupervisorId: supervisor.supervisorId,
    FirstName: supervisor.firstName,
    LastName: supervisor.lastName,
    Email: supervisor.email,
  }));

  await overwriteTabRows(payrollConfigFileId, SUPERVISORS_TAB, SUPERVISORS_HEADERS, rows);
};

export default writeSupervisors;
