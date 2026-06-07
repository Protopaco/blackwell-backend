import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import Supervisor from '#models/Supervisor.js';
import mapSupervisor from '#db/supervisor/mapSupervisor.js';

const readSupervisors = async (payrollConfigFileId: string): Promise<Supervisor[]> => {
  const rows = await sheetsAdapter.readTab(payrollConfigFileId, 'Supervisors');
  return rows.map(mapSupervisor);
};

export default readSupervisors;
