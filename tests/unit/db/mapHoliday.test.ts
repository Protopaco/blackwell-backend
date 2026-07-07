import { describe, it, expect } from 'vitest';
import mapHoliday from '#db/holiday/mapHoliday.js';

describe('mapHoliday', () => {
  it('maps a full row to a Holiday', () => {
    const holiday = mapHoliday({
      HolidayId: 'h1',
      HolidayName: 'Independence Day',
      HolidayDate: '2026-07-04',
    });

    expect(holiday).toEqual({
      holidayId: 'h1',
      holidayName: 'Independence Day',
      holidayDate: '2026-07-04',
    });
  });
});
