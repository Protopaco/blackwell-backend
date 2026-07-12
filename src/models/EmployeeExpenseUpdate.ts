import Guid from '#models/Guid.js';

interface EmployeeExpenseUpdate {
  employeeId: Guid;
  totalExpense: number | null;
}

export default EmployeeExpenseUpdate;
