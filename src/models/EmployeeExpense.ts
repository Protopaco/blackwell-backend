import Guid from '#models/Guid.js';

interface EmployeeExpense {
  employeeId: Guid;
  employeeName: string;
  wageExpense: number | null;
  taxExpense: number | null;
}

export default EmployeeExpense;
