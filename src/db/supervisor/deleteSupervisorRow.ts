import readTab from '#db/adapter/readTab.js';
import deleteRow from '#db/adapter/deleteRow.js';
import { SUPERVISORS_TAB } from '#config/constants.js';
import { NotFoundError } from '#utils/errors.js';

// Deletes a single supervisor row from the Supervisors tab by supervisorId.
const deleteSupervisorRow = async (payrollConfigFileId: string, supervisorId: string): Promise<void> => {
  const rows = await readTab(payrollConfigFileId, SUPERVISORS_TAB);

  // Find the 1-based row number of the supervisor entry
  // Add 2 to account for: 1 for the header row, 1 for the 0-to-1 index conversion
  const rowIndex = rows.findIndex((row) => row['SupervisorId'] === supervisorId);
  if (rowIndex === -1) throw new NotFoundError(`Supervisor not found: ${supervisorId}`);

  const rowNumber = rowIndex + 2;
  await deleteRow(payrollConfigFileId, SUPERVISORS_TAB, rowNumber);
};

export default deleteSupervisorRow;
