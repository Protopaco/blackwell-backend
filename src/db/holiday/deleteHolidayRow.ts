import readTab from '#db/adapter/readTab.js';
import deleteRow from '#db/adapter/deleteRow.js';
import { HOLIDAYS_TAB } from '#config/constants.js';
import { NotFoundError } from '#utils/errors.js';

// Deletes a single holiday row from the Holidays tab by holidayId.
const deleteHolidayRow = async (payrollConfigFileId: string, holidayId: string): Promise<void> => {
  const rows = await readTab(payrollConfigFileId, HOLIDAYS_TAB);

  // Find the 1-based row number of the holiday entry
  // Add 2 to account for: 1 for the header row, 1 for the 0-to-1 index conversion
  const rowIndex = rows.findIndex((row) => row['HolidayId'] === holidayId);
  if (rowIndex === -1) throw new NotFoundError(`Holiday not found: ${holidayId}`);

  const rowNumber = rowIndex + 2;
  await deleteRow(payrollConfigFileId, HOLIDAYS_TAB, rowNumber);
};

export default deleteHolidayRow;
