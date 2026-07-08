import { describe, it, expect } from 'vitest';
import deriveTimesheetStatus from '#services/timesheet/deriveTimesheetStatus.js';

describe('deriveTimesheetStatus', () => {
  it('returns NotGenerated when totalHours is null, even if every other flag is true', () => {
    const status = deriveTimesheetStatus({
      totalHours: null,
      employeeSigned: true,
      supervisorSigned: true,
      includedInCurrentHours: true,
    });
    expect(status).toBe('NotGenerated');
  });

  it('treats 0 total hours as generated, not as null', () => {
    const status = deriveTimesheetStatus({
      totalHours: 0,
      employeeSigned: false,
      supervisorSigned: false,
      includedInCurrentHours: false,
    });
    expect(status).toBe('Generated');
  });

  it('returns Generated when the employee has not signed, even if the supervisor has', () => {
    const status = deriveTimesheetStatus({
      totalHours: 72.5,
      employeeSigned: false,
      supervisorSigned: true,
      includedInCurrentHours: true,
    });
    expect(status).toBe('Generated');
  });

  it('returns Submitted when the employee signed but the supervisor has not', () => {
    const status = deriveTimesheetStatus({
      totalHours: 72.5,
      employeeSigned: true,
      supervisorSigned: false,
      includedInCurrentHours: true,
    });
    expect(status).toBe('Submitted');
  });

  it('returns Approved when both signed but hours are not yet in current_hours', () => {
    const status = deriveTimesheetStatus({
      totalHours: 72.5,
      employeeSigned: true,
      supervisorSigned: true,
      includedInCurrentHours: false,
    });
    expect(status).toBe('Approved');
  });

  it('returns Complete when both signed and hours are included in current_hours', () => {
    const status = deriveTimesheetStatus({
      totalHours: 72.5,
      employeeSigned: true,
      supervisorSigned: true,
      includedInCurrentHours: true,
    });
    expect(status).toBe('Complete');
  });
});
