import EmployeeExpense from '#models/EmployeeExpense.js';
import EmployeeExpenseUpdate from '#models/EmployeeExpenseUpdate.js';

// Overlays wageExpense/taxExpense onto existing employee expense records by employeeId, leaving
// employeeName untouched. Updates for an employeeId not present in existingExpenses are ignored here —
// updateEmployeeExpensesBatch.ts handles creating new records for those separately, since doing so requires
// resolving employeeName from PayrollConfig, which this function has no dependency on.
const mergeEmployeeExpenseTotals = (
  existingExpenses: EmployeeExpense[],
  updates: EmployeeExpenseUpdate[],
): EmployeeExpense[] => {
  const updateByEmployeeId = new Map(updates.map((update) => [update.employeeId, update]));

  return existingExpenses.map((expense) => {
    const update = updateByEmployeeId.get(expense.employeeId);
    return update
      ? { ...expense, wageExpense: update.wageExpense ?? null, taxExpense: update.taxExpense ?? null }
      : expense;
  });
};

export default mergeEmployeeExpenseTotals;
