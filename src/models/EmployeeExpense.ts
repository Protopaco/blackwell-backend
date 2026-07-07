import Guid from '#models/Guid.js';

interface EmployeeExpense {
  employeeId: Guid;
  employeeName: string;
  activeThisPayPeriod: boolean;
  totalExpense: number | null;
}

export default EmployeeExpense;
