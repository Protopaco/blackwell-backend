import EmployeeExpense from '#models/EmployeeExpense.js';
import EmployeeExpenseUpdate from '#models/EmployeeExpenseUpdate.js';

// Overlays totalExpense onto existing employee expense records by employeeId, leaving employeeName
// untouched. Updates for an employeeId not present in existingExpenses are ignored here —
// updateEmployeeExpensesBatch.ts handles creating new records for those separately, since doing so requires
// resolving employeeName from PayrollConfig, which this function has no dependency on.
const mergeEmployeeExpenseTotals = (
  existingExpenses: EmployeeExpense[],
  updates: EmployeeExpenseUpdate[],
): EmployeeExpense[] => {
  const totalExpenseByEmployeeId = new Map(
    updates.map((update) => [update.employeeId, update.totalExpense]),
  );

  return existingExpenses.map((expense) =>
    totalExpenseByEmployeeId.has(expense.employeeId)
      ? { ...expense, totalExpense: totalExpenseByEmployeeId.get(expense.employeeId) ?? null }
      : expense,
  );
};

export default mergeEmployeeExpenseTotals;
