import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import Guid from '#models/Guid.js';

const EMPLOYEES_TAB = 'Employees';

// 0-based column index → A1 column letter
const toColumnLetter = (colIndex: number): string => {
  let result = '';
  let remaining = colIndex + 1;
  while (remaining > 0) {
    remaining--;
    result = String.fromCharCode(65 + (remaining % 26)) + result;
    remaining = Math.floor(remaining / 26);
  }
  return result;
};

const updateEmployeeTimesheetFile = async (
  payrollConfigFileId: string,
  employeeId: Guid,
  timesheetFileId: string,
  timesheetFileLink: string,
): Promise<void> => {
  const rows = await sheetsAdapter.readTabValues(payrollConfigFileId, EMPLOYEES_TAB);
  if (rows.length === 0) throw new Error('Employees tab is empty');

  const headers = rows[0] as string[];
  const employeeIdColIndex = headers.indexOf('EmployeeId');
  const fileIdColIndex = headers.indexOf('TimesheetFileId');
  const fileLinkColIndex = headers.indexOf('TimesheetFileLink');

  if (employeeIdColIndex === -1) throw new Error('EmployeeId column not found in Employees tab');
  if (fileIdColIndex === -1) throw new Error('TimesheetFileId column not found in Employees tab');
  if (fileLinkColIndex === -1) throw new Error('TimesheetFileLink column not found in Employees tab');

  // rows[0] is headers, so employee data starts at rows[1] → sheet row 2
  const employeeRowIndex = rows.findIndex((row) => row[employeeIdColIndex] === employeeId);
  if (employeeRowIndex === -1) throw new Error(`Employee not found in Employees tab: ${employeeId}`);

  const sheetRowNumber = employeeRowIndex + 1; // 1-based

  await sheetsAdapter.updateCells(
    payrollConfigFileId,
    `${EMPLOYEES_TAB}!${toColumnLetter(fileIdColIndex)}${sheetRowNumber}`,
    [[timesheetFileId]],
  );

  await sheetsAdapter.updateCells(
    payrollConfigFileId,
    `${EMPLOYEES_TAB}!${toColumnLetter(fileLinkColIndex)}${sheetRowNumber}`,
    [[timesheetFileLink]],
  );
};

export default updateEmployeeTimesheetFile;
