import { describe, it, expect } from 'vitest';
import mergeEmployeeExpenseTotals from '#services/payrollReport/mergeEmployeeExpenseTotals.js';

describe('mergeEmployeeExpenseTotals', () => {
  it('overlays wageExpense onto a matching record, preserving employeeName', () => {
    const merged = mergeEmployeeExpenseTotals(
      [{ employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100 }],
      [{ employeeId: 'e1', wageExpense: 200 }],
    );

    expect(merged).toEqual([
      { employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 200 },
    ]);
  });

  it('leaves records untouched when their employeeId is not in the updates', () => {
    const merged = mergeEmployeeExpenseTotals(
      [{ employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100 }],
      [],
    );

    expect(merged).toEqual([
      { employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100 },
    ]);
  });

  it('ignores an update for an employeeId not present in the existing expenses', () => {
    const merged = mergeEmployeeExpenseTotals(
      [{ employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100 }],
      [{ employeeId: 'unknown', wageExpense: 999 }],
    );

    expect(merged).toEqual([
      { employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100 },
    ]);
  });

  it('updates only the matching records when some employees are updated and others are not', () => {
    const merged = mergeEmployeeExpenseTotals(
      [
        { employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100 },
        { employeeId: 'e2', employeeName: 'John Doe', wageExpense: 50 },
      ],
      [{ employeeId: 'e1', wageExpense: 200 }],
    );

    expect(merged).toEqual([
      { employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 200 },
      { employeeId: 'e2', employeeName: 'John Doe', wageExpense: 50 },
    ]);
  });

  it('allows a wageExpense update to null', () => {
    const merged = mergeEmployeeExpenseTotals(
      [{ employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100 }],
      [{ employeeId: 'e1', wageExpense: null }],
    );

    expect(merged[0].wageExpense).toBeNull();
  });

  it('returns an empty array when there are no existing expenses', () => {
    expect(
      mergeEmployeeExpenseTotals([], [{ employeeId: 'e1', wageExpense: 200 }]),
    ).toEqual([]);
  });
});
