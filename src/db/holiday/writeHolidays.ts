import writeTab from '#db/adapter/writeTab.js';
import readHolidays from '#db/holiday/readHolidays.js';
import { HOLIDAYS_TAB } from '#config/constants.js';
import Holiday from '#models/Holiday.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites all holiday rows, updating the one matching the given holiday.
const writeHolidays = async (
  payrollConfigFileId: string,
  updatedHoliday: Holiday,
): Promise<void> => {
  const holidays = await readHolidays(payrollConfigFileId);

  const index = holidays.findIndex((holiday) => holiday.holidayId === updatedHoliday.holidayId);
  if (index === -1) throw new NotFoundError(`Holiday not found: ${updatedHoliday.holidayId}`);

  holidays[index] = updatedHoliday;

  const rows = holidays.map((holiday) => ({
    HolidayId: holiday.holidayId,
    HolidayName: holiday.holidayName,
    HolidayDate: holiday.holidayDate,
  }));

  await writeTab(payrollConfigFileId, HOLIDAYS_TAB, rows);
};

export default writeHolidays;
