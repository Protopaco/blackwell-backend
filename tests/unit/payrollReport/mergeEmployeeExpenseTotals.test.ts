import { describe, it, expect } from 'vitest';
import mergeEmployeeExpenseTotals from '#services/payrollReport/mergeEmployeeExpenseTotals.js';

describe('mergeEmployeeExpenseTotals', () => {
  it('overlays wageExpense and taxExpense onto a matching record, preserving employeeName', () => {
    const merged = mergeEmployeeExpenseTotals(
      [{ employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100, taxExpense: 10 }],
      [{ employeeId: 'e1', wageExpense: 200, taxExpense: 20 }],
    );

    expect(merged).toEqual([
      { employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 200, taxExpense: 20 },
    ]);
  });

  it('leaves records untouched when their employeeId is not in the updates', () => {
    const merged = mergeEmployeeExpenseTotals(
      [{ employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100, taxExpense: 10 }],
      [],
    );

    expect(merged).toEqual([
      { employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100, taxExpense: 10 },
    ]);
  });

  it('ignores an update for an employeeId not present in the existing expenses', () => {
    const merged = mergeEmployeeExpenseTotals(
      [{ employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100, taxExpense: 10 }],
      [{ employeeId: 'unknown', wageExpense: 999, taxExpense: 99 }],
    );

    expect(merged).toEqual([
      { employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100, taxExpense: 10 },
    ]);
  });

  it('updates only the matching records when some employees are updated and others are not', () => {
    const merged = mergeEmployeeExpenseTotals(
      [
        { employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100, taxExpense: 10 },
        { employeeId: 'e2', employeeName: 'John Doe', wageExpense: 50, taxExpense: 5 },
      ],
      [{ employeeId: 'e1', wageExpense: 200, taxExpense: 20 }],
    );

    expect(merged).toEqual([
      { employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 200, taxExpense: 20 },
      { employeeId: 'e2', employeeName: 'John Doe', wageExpense: 50, taxExpense: 5 },
    ]);
  });

  it('allows a wageExpense/taxExpense update to null', () => {
    const merged = mergeEmployeeExpenseTotals(
      [{ employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100, taxExpense: 10 }],
      [{ employeeId: 'e1', wageExpense: null, taxExpense: null }],
    );

    expect(merged[0].wageExpense).toBeNull();
    expect(merged[0].taxExpense).toBeNull();
  });

  it('allows wageExpense and taxExpense to be updated independently', () => {
    const merged = mergeEmployeeExpenseTotals(
      [{ employeeId: 'e1', employeeName: 'Jane Smith', wageExpense: 100, taxExpense: 10 }],
      [{ employeeId: 'e1', wageExpense: 200, taxExpense: null }],
    );

    expect(merged[0].wageExpense).toBe(200);
    expect(merged[0].taxExpense).toBeNull();
  });

  it('returns an empty array when there are no existing expenses', () => {
    expect(
      mergeEmployeeExpenseTotals([], [{ employeeId: 'e1', wageExpense: 200, taxExpense: 20 }]),
    ).toEqual([]);
  });
});
