import { describe, it, expect } from 'vitest';
import {
  getDatesBetween,
  chunkDatesByWeek,
  formatDateHeader,
  getDayOfWeek,
  getHolidayName,
} from '#utils/dateUtils.js';
import Holiday from '#models/Holiday.js';

describe('getDatesBetween', () => {
  it('returns all dates between start and end inclusive', () => {
    const dates = getDatesBetween('2026-06-01', '2026-06-07');
    expect(dates).toHaveLength(7);
  });

  it('returns a single date when start equals end', () => {
    const dates = getDatesBetween('2026-06-01', '2026-06-01');
    expect(dates).toHaveLength(1);
  });

  it('returns 14 dates for a bi-weekly period', () => {
    const dates = getDatesBetween('2026-06-01', '2026-06-14');
    expect(dates).toHaveLength(14);
  });
});

describe('chunkDatesByWeek', () => {
  it('splits 14 dates into 2 weeks of 7', () => {
    const dates = getDatesBetween('2026-06-01', '2026-06-14');
    const weeks = chunkDatesByWeek(dates);
    expect(weeks).toHaveLength(2);
    expect(weeks[0]).toHaveLength(7);
    expect(weeks[1]).toHaveLength(7);
  });

  it('chunks from the start date regardless of day of week', () => {
    const dates = getDatesBetween('2026-06-03', '2026-06-09'); // starts on Wednesday
    const weeks = chunkDatesByWeek(dates);
    expect(weeks).toHaveLength(1);
    expect(weeks[0]).toHaveLength(7);
  });
});

describe('formatDateHeader', () => {
  it('formats date as M/D', () => {
    const date = new Date('2026-06-01T12:00:00Z');
    expect(formatDateHeader(date)).toBe('6/1');
  });

  it('formats date without leading zeros', () => {
    const date = new Date('2026-12-25T12:00:00Z');
    expect(formatDateHeader(date)).toBe('12/25');
  });
});

describe('getDayOfWeek', () => {
  it('returns correct day name', () => {
    const monday = new Date('2026-06-01T12:00:00Z');
    expect(getDayOfWeek(monday)).toBe('Mon');
  });

  it('returns Sun for Sunday', () => {
    const sunday = new Date('2026-06-07T12:00:00Z');
    expect(getDayOfWeek(sunday)).toBe('Sun');
  });
});

describe('getHolidayName', () => {
  const holidays: Holiday[] = [
    { holidayId: '1', holidayName: 'Independence Day', holidayDate: '2026-07-04' },
    { holidayId: '2', holidayName: 'Labor Day', holidayDate: '2026-09-07' },
  ];

  it('returns holiday name when date matches', () => {
    const date = new Date('2026-07-04T12:00:00Z');
    expect(getHolidayName(date, holidays)).toBe('Independence Day');
  });

  it('returns null when date is not a holiday', () => {
    const date = new Date('2026-07-05T12:00:00Z');
    expect(getHolidayName(date, holidays)).toBeNull();
  });

  it('returns null for empty holiday list', () => {
    const date = new Date('2026-07-04T12:00:00Z');
    expect(getHolidayName(date, [])).toBeNull();
  });
});
