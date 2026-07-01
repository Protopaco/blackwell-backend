interface PayrollReportSummaryRow {
  GeneratedAt: string;
  EmployeeId: string;
  EmployeeName: string;
  PayrollCategory: string;
  PayRate: string;
  TotalHours: number;
  HolidayHours: number;
}

export default PayrollReportSummaryRow;
