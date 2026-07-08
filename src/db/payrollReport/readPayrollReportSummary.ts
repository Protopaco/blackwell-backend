import readTab from "#db/adapter/readTab.js";
import tabExists from "#db/adapter/tabExists.js";
import { CURRENT_PAYROLL_SUMMARY_TAB } from "#config/constants.js";

// Reads all rows from the current_payroll_summary tab of a payroll report file. Returns null if the tab
// doesn't exist yet, or an empty array if it exists but has no rows.
const readPayrollReportSummary = async (
  payrollReportFileId: string,
): Promise<Record<string, unknown>[] | null> => {
  const exists = await tabExists(payrollReportFileId, CURRENT_PAYROLL_SUMMARY_TAB);
  if (!exists) return null;

  return readTab(payrollReportFileId, CURRENT_PAYROLL_SUMMARY_TAB);
};

export default readPayrollReportSummary;
