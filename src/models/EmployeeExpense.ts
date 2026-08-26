import Guid from '#models/Guid.js';

interface EmployeeExpense {
  employeeId: Guid;
  employeeName: string;
  wageExpense: number | null;
}

export default EmployeeExpense;
