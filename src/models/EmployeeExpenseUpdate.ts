import Guid from '#models/Guid.js';

interface EmployeeExpenseUpdate {
  employeeId: Guid;
  wageExpense: number | null;
  taxExpense: number | null;
}

export default EmployeeExpenseUpdate;
