import Guid from '#models/Guid.js';

interface EmployeeExpenseUpdate {
  employeeId: Guid;
  wageExpense: number | null;
}

export default EmployeeExpenseUpdate;
