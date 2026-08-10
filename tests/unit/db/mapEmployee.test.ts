import { describe, it, expect } from 'vitest';
import mapEmployee from '#db/employee/mapEmployee.js';

describe('mapEmployee', () => {
  it('maps a full row to an Employee', () => {
    const employee = mapEmployee({
      EmployeeId: 'e1',
      FirstName: 'Jane',
      LastName: 'Smith',
      Position: 'Program Director',
      SalaryAmount: '2000',
      Email: 'jane.smith@example.org',
      Status: 'Active',
      TimesheetFileId: '1',
    });

    expect(employee).toEqual({
      employeeId: 'e1',
      firstName: 'Jane',
      lastName: 'Smith',
      position: 'Program Director',
      salaryAmount: 2000,
      activityRates: [],
      email: 'jane.smith@example.org',
      status: 'Active',
      timesheetFileId: '1',
    });
  });

  describe('salaryAmount fallback', () => {
    it('falls back to 0 for an empty string', () => {
      expect(mapEmployee({ SalaryAmount: '' }).salaryAmount).toBe(0);
    });

    it('falls back to 0 for a missing value', () => {
      expect(mapEmployee({}).salaryAmount).toBe(0);
    });

    it('falls back to 0 for a non-numeric string', () => {
      expect(mapEmployee({ SalaryAmount: 'n/a' }).salaryAmount).toBe(0);
    });

    it('preserves 0 as an explicit amount', () => {
      expect(mapEmployee({ SalaryAmount: '0' }).salaryAmount).toBe(0);
    });
  });
});
