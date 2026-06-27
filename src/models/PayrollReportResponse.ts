import PayrollReportSummaryEntry from './PayrollReportSummaryEntry.js';

interface PayrollReportResponse {
  generatedAt: string;
  rows: PayrollReportSummaryEntry[];
}

export default PayrollReportResponse;
