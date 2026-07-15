import updateCells from '#db/adapter/updateCells.js';
import readManifest from '#db/manifest/readManifest.js';
import FillGeneratedTimesheetInput from '../models/FillGeneratedTimesheetInput.js';

const columnToLetter = (column: number): string => {
  let dividend = column;
  let columnName = '';

  while (dividend > 0) {
    const modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }

  return columnName;
};

const quoteSheetName = (tabName: string): string => `'${tabName.replace(/'/g, "''")}'`;

const fillGeneratedTimesheet = async ({
  timesheetFileId,
  payPeriodId,
  tabName,
  entries = [],
  employeeSigned = false,
  supervisorSigned = false,
}: FillGeneratedTimesheetInput): Promise<void> => {
  const manifest = await readManifest(timesheetFileId, tabName);
  if (!manifest) throw new Error(`fillGeneratedTimesheet manifest not found: ${tabName}`);
  if (manifest.payPeriodId !== payPeriodId) {
    throw new Error(`fillGeneratedTimesheet manifest payPeriodId mismatch: ${payPeriodId}`);
  }

  for (const entry of entries) {
    const week = manifest.weeks.find((candidate) =>
      candidate.dates.some((dateEntry) => dateEntry.date === entry.date),
    );
    if (!week) throw new Error(`fillGeneratedTimesheet date not found: ${entry.date}`);

    const activityRow = [...week.activityRows, ...week.flatRateRows].find(
      (candidate) => candidate.activityId === entry.activityId,
    );
    if (!activityRow) throw new Error(`fillGeneratedTimesheet activity not found: ${entry.activityId}`);

    const dateColumn = week.dates.find((candidate) => candidate.date === entry.date);
    if (!dateColumn) throw new Error(`fillGeneratedTimesheet date not found: ${entry.date}`);

    const cell = `${columnToLetter(dateColumn.column)}${activityRow.row}`;
    await updateCells(timesheetFileId, `${quoteSheetName(tabName)}!${cell}`, [[entry.value]]);
  }

  if (employeeSigned) {
    const cell = `${columnToLetter(manifest.employeeSignatureCell.column)}${manifest.employeeSignatureCell.row}`;
    await updateCells(timesheetFileId, `${quoteSheetName(tabName)}!${cell}`, [['Test Employee']]);
  }

  if (supervisorSigned) {
    const cell = `${columnToLetter(manifest.supervisorSignatureCell.column)}${manifest.supervisorSignatureCell.row}`;
    await updateCells(timesheetFileId, `${quoteSheetName(tabName)}!${cell}`, [['Test Supervisor']]);
  }
};

export default fillGeneratedTimesheet;
