import readTab from '#db/adapter/readTab.js';
import Supervisor from '#models/Supervisor.js';
import mapSupervisor from '#db/supervisor/mapSupervisor.js';

// Reads all supervisors from the Supervisors tab of a client's payroll config file.
const readSupervisors = async (payrollConfigFileId: string): Promise<Supervisor[]> => {
  const rows = await readTab(payrollConfigFileId, 'Supervisors');
  return rows.map(mapSupervisor);
};

export default readSupervisors;
