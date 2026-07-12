import EmployeeExpense from '#models/EmployeeExpense.js';
import EmployeeExpenseUpdate from '#models/EmployeeExpenseUpdate.js';

// Overlays totalExpense onto existing employee expense records by employeeId, leaving employeeName and
// activeThisPayPeriod untouched. Updates for an employeeId not present in existingExpenses are ignored —
// there's no employeeName/activeThisPayPeriod to construct a new record from.
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
