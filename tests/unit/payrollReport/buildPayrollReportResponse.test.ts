import { describe, it, expect } from 'vitest';
import buildPayrollReportResponse from '#services/payrollReport/buildPayrollReportResponse.js';

describe('buildPayrollReportResponse', () => {
  it('groups rows by employeeId and sets the employee name from the first row seen', () => {
    const response = buildPayrollReportResponse([
      { EmployeeId: 'e1', EmployeeName: 'Jane Smith', PayRate: 'HourlyPayRate1', PayrollCategory: 'Regular', IsHoliday: 'FALSE', TotalHours: '8' },
      { EmployeeId: 'e2', EmployeeName: 'John Doe', PayRate: 'HourlyPayRate1', PayrollCategory: 'Regular', IsHoliday: 'FALSE', TotalHours: '5' },
    ]);

    expect(Object.keys(response)).toEqual(['e1', 'e2']);
    expect(response.e1.employeeName).toBe('Jane Smith');
    expect(response.e2.employeeName).toBe('John Doe');
  });

  it('routes hourly pay rates into the hourly bucket', () => {
    const response = buildPayrollReportResponse([
      { EmployeeId: 'e1', EmployeeName: 'Jane Smith', PayRate: 'HourlyPayRate1', PayrollCategory: 'Regular', IsHoliday: 'FALSE', TotalHours: '8' },
    ]);

    expect(response.e1.hourly).toEqual([
      { payrollCategory: 'Regular', payRate: 'HourlyPayRate1', isHoliday: false, totalHours: 8 },
    ]);
    expect(response.e1.flatRate).toEqual([]);
  });

  it('routes flat pay rates into the flatRate bucket', () => {
    const response = buildPayrollReportResponse([
      { EmployeeId: 'e1', EmployeeName: 'Jane Smith', PayRate: 'FlatPayRate1', TotalHours: '3' },
    ]);

    expect(response.e1.flatRate).toEqual([{ payRate: 'FlatPayRate1', quantity: 3 }]);
    expect(response.e1.hourly).toEqual([]);
  });

  it('accumulates multiple rows for the same employee into their existing buckets', () => {
    const response = buildPayrollReportResponse([
      { EmployeeId: 'e1', EmployeeName: 'Jane Smith', PayRate: 'HourlyPayRate1', PayrollCategory: 'Regular', IsHoliday: 'FALSE', TotalHours: '8' },
      { EmployeeId: 'e1', EmployeeName: 'Jane Smith', PayRate: 'FlatPayRate1', TotalHours: '3' },
    ]);

    expect(response.e1.hourly).toHaveLength(1);
    expect(response.e1.flatRate).toHaveLength(1);
  });

  describe('totalHours and totalFlatRate', () => {
    it('sums totalHours across multiple hourly rows for the same employee', () => {
      const response = buildPayrollReportResponse([
        { EmployeeId: 'e1', EmployeeName: 'Jane Smith', PayRate: 'HourlyPayRate1', PayrollCategory: 'Regular', IsHoliday: 'FALSE', TotalHours: '8' },
        { EmployeeId: 'e1', EmployeeName: 'Jane Smith', PayRate: 'HourlyPayRate2', PayrollCategory: 'ETO', IsHoliday: 'FALSE', TotalHours: '2.5' },
      ]);

      expect(response.e1.totalHours).toBe(10.5);
    });

    it('sums totalFlatRate across multiple flat rate rows for the same employee', () => {
      const response = buildPayrollReportResponse([
        { EmployeeId: 'e1', EmployeeName: 'Jane Smith', PayRate: 'FlatPayRate1', TotalHours: '3' },
        { EmployeeId: 'e1', EmployeeName: 'Jane Smith', PayRate: 'FlatPayRate2', TotalHours: '1' },
      ]);

      expect(response.e1.totalFlatRate).toBe(4);
    });

    it('keeps totalHours and totalFlatRate at 0 when an employee has no rows in that bucket', () => {
      const response = buildPayrollReportResponse([
        { EmployeeId: 'e1', EmployeeName: 'Jane Smith', PayRate: 'HourlyPayRate1', PayrollCategory: 'Regular', IsHoliday: 'FALSE', TotalHours: '8' },
      ]);

      expect(response.e1.totalHours).toBe(8);
      expect(response.e1.totalFlatRate).toBe(0);
    });

    it('keeps totals for different employees independent', () => {
      const response = buildPayrollReportResponse([
        { EmployeeId: 'e1', EmployeeName: 'Jane Smith', PayRate: 'HourlyPayRate1', PayrollCategory: 'Regular', IsHoliday: 'FALSE', TotalHours: '8' },
        { EmployeeId: 'e2', EmployeeName: 'John Doe', PayRate: 'HourlyPayRate1', PayrollCategory: 'Regular', IsHoliday: 'FALSE', TotalHours: '5' },
        { EmployeeId: 'e2', EmployeeName: 'John Doe', PayRate: 'FlatPayRate1', TotalHours: '2' },
      ]);

      expect(response.e1.totalHours).toBe(8);
      expect(response.e1.totalFlatRate).toBe(0);
      expect(response.e2.totalHours).toBe(5);
      expect(response.e2.totalFlatRate).toBe(2);
    });
  });

  describe('isHoliday coercion', () => {
    it('treats the string "TRUE" as true', () => {
      const response = buildPayrollReportResponse([
        { EmployeeId: 'e1', EmployeeName: 'Jane Smith', PayRate: 'HourlyPayRate1', PayrollCategory: 'Regular', IsHoliday: 'TRUE', TotalHours: '8' },
      ]);
      expect(response.e1.hourly[0].isHoliday).toBe(true);
    });

    it('treats a boolean true as true', () => {
      const response = buildPayrollReportResponse([
        { EmployeeId: 'e1', EmployeeName: 'Jane Smith', PayRate: 'HourlyPayRate1', PayrollCategory: 'Regular', IsHoliday: true, TotalHours: '8' },
      ]);
      expect(response.e1.hourly[0].isHoliday).toBe(true);
    });

    it('treats the string "FALSE" as false', () => {
      const response = buildPayrollReportResponse([
        { EmployeeId: 'e1', EmployeeName: 'Jane Smith', PayRate: 'HourlyPayRate1', PayrollCategory: 'Regular', IsHoliday: 'FALSE', TotalHours: '8' },
      ]);
      expect(response.e1.hourly[0].isHoliday).toBe(false);
    });
  });

  it('returns an empty object for no rows', () => {
    expect(buildPayrollReportResponse([])).toEqual({});
  });
});
