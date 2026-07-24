import { describe, it, expect } from 'vitest';
import mapHolidayRow from '#db/holiday/mapHolidayRow.js';
import Holiday from '#models/Holiday.js';

describe('mapHolidayRow', () => {
  it('maps a Holiday to a row object keyed by HOLIDAYS_HEADERS', () => {
    const holiday: Holiday = {
      holidayId: 'h1',
      holidayName: 'Labor Day',
      holidayDate: '2026-09-07',
    };

    expect(mapHolidayRow(holiday)).toEqual({
      HolidayId: 'h1',
      HolidayName: 'Labor Day',
      HolidayDate: '2026-09-07',
    });
  });
});
