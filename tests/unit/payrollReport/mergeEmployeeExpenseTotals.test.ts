import { describe, it, expect } from 'vitest';
import mergeEmployeeExpenseTotals from '#services/payrollReport/mergeEmployeeExpenseTotals.js';

describe('mergeEmployeeExpenseTotals', () => {
  it('overlays totalExpense onto a matching record, preserving employeeName', () => {
    const merged = mergeEmployeeExpenseTotals(
      [{ employeeId: 'e1', employeeName: 'Jane Smith', totalExpense: 100 }],
      [{ employeeId: 'e1', totalExpense: 200 }],
    );

    expect(merged).toEqual([
      { employeeId: 'e1', employeeName: 'Jane Smith', totalExpense: 200 },
    ]);
  });

  it('leaves records untouched when their employeeId is not in the updates', () => {
    const merged = mergeEmployeeExpenseTotals(
      [{ employeeId: 'e1', employeeName: 'Jane Smith', totalExpense: 100 }],
      [],
    );

    expect(merged).toEqual([
      { employeeId: 'e1', employeeName: 'Jane Smith', totalExpense: 100 },
    ]);
  });

  it('ignores an update for an employeeId not present in the existing expenses', () => {
    const merged = mergeEmployeeExpenseTotals(
      [{ employeeId: 'e1', employeeName: 'Jane Smith', totalExpense: 100 }],
      [{ employeeId: 'unknown', totalExpense: 999 }],
    );

    expect(merged).toEqual([
      { employeeId: 'e1', employeeName: 'Jane Smith', totalExpense: 100 },
    ]);
  });

  it('updates only the matching records when some employees are updated and others are not', () => {
    const merged = mergeEmployeeExpenseTotals(
      [
        { employeeId: 'e1', employeeName: 'Jane Smith', totalExpense: 100 },
        { employeeId: 'e2', employeeName: 'John Doe', totalExpense: 50 },
      ],
      [{ employeeId: 'e1', totalExpense: 200 }],
    );

    expect(merged).toEqual([
      { employeeId: 'e1', employeeName: 'Jane Smith', totalExpense: 200 },
      { employeeId: 'e2', employeeName: 'John Doe', totalExpense: 50 },
    ]);
  });

  it('allows a totalExpense update to null', () => {
    const merged = mergeEmployeeExpenseTotals(
      [{ employeeId: 'e1', employeeName: 'Jane Smith', totalExpense: 100 }],
      [{ employeeId: 'e1', totalExpense: null }],
    );

    expect(merged[0].totalExpense).toBeNull();
  });

  it('returns an empty array when there are no existing expenses', () => {
    expect(mergeEmployeeExpenseTotals([], [{ employeeId: 'e1', totalExpense: 200 }])).toEqual([]);
  });
});
