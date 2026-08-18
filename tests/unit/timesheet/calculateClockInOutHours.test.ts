import { describe, it, expect } from 'vitest';
import calculateClockInOutHours from '#services/timesheet/calculateClockInOutHours.js';

describe('calculateClockInOutHours', () => {
  it('returns the exact elapsed hours when the span already lands on a quarter hour', () => {
    expect(calculateClockInOutHours(9, 17)).toBe(8);
    expect(calculateClockInOutHours(9, 12.25)).toBe(3.25);
    expect(calculateClockInOutHours(9, 12.5)).toBe(3.5);
    expect(calculateClockInOutHours(9, 12.75)).toBe(3.75);
  });

  it('rounds down to the nearest quarter hour when closer to the lower boundary', () => {
    // 9:00 AM to 12:05 PM = 3 hours 5 minutes = 3.0833... hours, closer to 3.0 than 3.25.
    expect(calculateClockInOutHours(9, 12 + 5 / 60)).toBe(3);
  });

  it('rounds up to the nearest quarter hour when closer to the upper boundary', () => {
    // 9:00 AM to 12:20 PM = 3 hours 20 minutes = 3.333... hours, closer to 3.25 than 3.5.
    expect(calculateClockInOutHours(9, 12 + 20 / 60)).toBe(3.25);
  });

  it('rounds a tie exactly halfway between quarter hours up (round-half-up)', () => {
    // 9:00 AM to 12:07:30 PM = 3 hours 7.5 minutes = 3.125 hours, exactly between 3.0 and 3.25.
    expect(calculateClockInOutHours(9, 12 + 7.5 / 60)).toBe(3.25);
  });

  it('returns 0 hours when Clock In and Clock Out are the same time', () => {
    expect(calculateClockInOutHours(9, 9)).toBe(0);
  });
});
