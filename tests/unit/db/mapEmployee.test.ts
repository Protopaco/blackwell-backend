import { describe, it, expect } from 'vitest';
import mapEmployee from '#db/employee/mapEmployee.js';

describe('mapEmployee', () => {
  it('maps a full row to an Employee', () => {
    const employee = mapEmployee({
      EmployeeId: 'e1',
      FirstName: 'Jane',
      LastName: 'Smith',
      Position: 'Program Director',
      HourlyPayRate1: '25.96',
      HourlyPayRate2: '36',
      HolidayPayRate: '38.94',
      Email: 'jane.smith@example.org',
      Status: 'Active',
      TimesheetFileId: '1',
    });

    expect(employee).toEqual({
      employeeId: 'e1',
      firstName: 'Jane',
      lastName: 'Smith',
      position: 'Program Director',
      hourlyPayRate1: 25.96,
      hourlyPayRate2: 36,
      holidayPayRate: 38.94,
      email: 'jane.smith@example.org',
      status: 'Active',
      timesheetFileId: '1',
    });
  });

  describe('pay rate fallback', () => {
    it('falls back to 0 for an empty string', () => {
      expect(mapEmployee({ HourlyPayRate1: '' }).hourlyPayRate1).toBe(0);
    });

    it('falls back to 0 for a missing value', () => {
      expect(mapEmployee({}).hourlyPayRate1).toBe(0);
    });

    it('falls back to 0 for a non-numeric string', () => {
      expect(mapEmployee({ HourlyPayRate1: 'n/a' }).hourlyPayRate1).toBe(0);
    });

    it('preserves 0 as an explicit rate', () => {
      expect(mapEmployee({ HourlyPayRate1: '0' }).hourlyPayRate1).toBe(0);
    });

    it('applies the same fallback independently to all three pay rate fields', () => {
      const employee = mapEmployee({
        HourlyPayRate1: '10',
        HourlyPayRate2: '',
        HolidayPayRate: undefined,
      });

      expect(employee.hourlyPayRate1).toBe(10);
      expect(employee.hourlyPayRate2).toBe(0);
      expect(employee.holidayPayRate).toBe(0);
    });
  });
});
