interface PayrollReportSummaryRow {
  GeneratedAt: string;
  EmployeeId: string;
  EmployeeName: string;
  PayrollCategory: string;
  IsHoliday: boolean;
  TotalHours: number;
}

export default PayrollReportSummaryRow;
