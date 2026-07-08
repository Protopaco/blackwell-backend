import { describe, it, expect } from 'vitest';
import sortPayrollReportTabs from '#services/payrollReport/sortPayrollReportTabs.js';

describe('sortPayrollReportTabs', () => {
  it('returns an empty array when no tabs exist', () => {
    expect(sortPayrollReportTabs([])).toEqual([]);
  });

  it('orders all five active tabs when every one exists', () => {
    const order = sortPayrollReportTabs([
      'AllocationReport',
      'current_hours',
      'AdditionalExpenses',
      'EmployeeExpenses',
      'current_payroll_summary',
    ]);
    expect(order).toEqual([
      'current_hours',
      'current_payroll_summary',
      'EmployeeExpenses',
      'AdditionalExpenses',
      'AllocationReport',
    ]);
  });

  it('filters out active tabs that do not exist yet, without leaving gaps', () => {
    const order = sortPayrollReportTabs(['current_hours', 'current_payroll_summary', 'EmployeeExpenses']);
    expect(order).toEqual(['current_hours', 'current_payroll_summary', 'EmployeeExpenses']);
  });

  it('puts archive tabs after active tabs', () => {
    const order = sortPayrollReportTabs(['current_hours', 'hrs_0601_0900']);
    expect(order).toEqual(['current_hours', 'hrs_0601_0900']);
  });

  it('sorts archive tabs by timestamp descending, newest closest to the active tabs', () => {
    const order = sortPayrollReportTabs(['hrs_0601_0900', 'hrs_0615_1000', 'hrs_0608_1100']);
    expect(order).toEqual(['hrs_0615_1000', 'hrs_0608_1100', 'hrs_0601_0900']);
  });

  it('keeps hrs_/payroll_ pairs from the same run adjacent, hrs_ first', () => {
    const order = sortPayrollReportTabs(['payroll_0601_0900', 'hrs_0601_0900']);
    expect(order).toEqual(['hrs_0601_0900', 'payroll_0601_0900']);
  });

  it('orders multiple full runs correctly: active, then each run newest-first with pairs adjacent', () => {
    const order = sortPayrollReportTabs([
      'current_hours',
      'current_payroll_summary',
      'payroll_0601_0900',
      'hrs_0601_0900',
      'payroll_0615_1000',
      'hrs_0615_1000',
    ]);
    expect(order).toEqual([
      'current_hours',
      'current_payroll_summary',
      'hrs_0615_1000',
      'payroll_0615_1000',
      'hrs_0601_0900',
      'payroll_0601_0900',
    ]);
  });
});
