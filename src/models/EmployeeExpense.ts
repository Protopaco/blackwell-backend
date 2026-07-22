import Guid from '#models/Guid.js';

interface EmployeeExpense {
  employeeId: Guid;
  employeeName: string;
  totalExpense: number | null;
}

export default EmployeeExpense;
