import { describe, it, expect } from 'vitest';
import parseClockTimeCell from '#services/timesheet/parseClockTimeCell.js';

describe('parseClockTimeCell', () => {
  it('returns null for a blank cell (undefined, null, or empty string)', () => {
    expect(parseClockTimeCell(undefined)).toBeNull();
    expect(parseClockTimeCell(null)).toBeNull();
    expect(parseClockTimeCell('')).toBeNull();
  });

  it('parses a morning time into decimal hours-of-day', () => {
    expect(parseClockTimeCell('9:00 AM')).toBe(9);
    expect(parseClockTimeCell('09:00 AM')).toBe(9);
    expect(parseClockTimeCell('9:30 AM')).toBe(9.5);
  });

  it('parses an afternoon/evening time into 24-hour decimal hours', () => {
    expect(parseClockTimeCell('1:00 PM')).toBe(13);
    expect(parseClockTimeCell('5:15 PM')).toBe(17.25);
    expect(parseClockTimeCell('11:45 PM')).toBe(23.75);
  });

  it('treats 12:00 AM as hour 0 and 12:00 PM as hour 12', () => {
    expect(parseClockTimeCell('12:00 AM')).toBe(0);
    expect(parseClockTimeCell('12:00 PM')).toBe(12);
  });

  it('is tolerant of lowercase meridiem and extra whitespace before it', () => {
    expect(parseClockTimeCell('9:00 am')).toBe(9);
    expect(parseClockTimeCell('9:00   AM')).toBe(9);
  });

  it('returns NaN for a present value that is not a recognizable time', () => {
    expect(Number.isNaN(parseClockTimeCell('abc'))).toBe(true);
    expect(Number.isNaN(parseClockTimeCell('2'))).toBe(true);
    expect(Number.isNaN(parseClockTimeCell('25:00 AM'))).toBe(true);
    expect(Number.isNaN(parseClockTimeCell('9:75 AM'))).toBe(true);
    expect(Number.isNaN(parseClockTimeCell('13:00 PM'))).toBe(true);
  });
});
