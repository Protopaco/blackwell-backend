import readTab from "#db/adapter/readTab.js";
import { CURRENT_PAYROLL_SUMMARY_TAB } from "#config/constants.js";

// Reads all rows from the current_payroll_summary tab of a payroll report file — returns empty array if the tab doesn't exist yet.
const readPayrollReportSummary = async (
  payrollReportFileId: string,
): Promise<Record<string, unknown>[]> => {
  try {
    return await readTab(payrollReportFileId, CURRENT_PAYROLL_SUMMARY_TAB);
  } catch {
    return [];
  }
};

export default readPayrollReportSummary;
