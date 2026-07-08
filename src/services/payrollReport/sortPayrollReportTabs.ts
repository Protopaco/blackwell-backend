import {
  CURRENT_HOURS_TAB,
  CURRENT_PAYROLL_SUMMARY_TAB,
  EMPLOYEE_EXPENSES_TAB,
  ADDITIONAL_EXPENSES_TAB,
  ALLOCATION_REPORT_TAB,
} from '#config/constants.js';

const ACTIVE_TAB_ORDER = [
  CURRENT_HOURS_TAB,
  CURRENT_PAYROLL_SUMMARY_TAB,
  EMPLOYEE_EXPENSES_TAB,
  ADDITIONAL_EXPENSES_TAB,
  ALLOCATION_REPORT_TAB,
];

// Strips the hrs_/payroll_ prefix from an archive tab name, leaving just its MMDD_HHmm timestamp — e.g. "hrs_0626_1430" -> "0626_1430".
const parseArchiveTimestamp = (tabName: string): string => tabName.replace(/^(hrs|payroll)_/, '');

// Orders payroll report workbook tabs: active tabs first (fixed order, filtered to whichever exist —
// e.g. AllocationReport doesn't exist until the bookkeeper gets that far), then archive tabs sorted by
// timestamp descending (most recently archived closest to the active tabs). hrs_/payroll_ pairs from the
// same run share a timestamp and are kept adjacent, hrs_ first.
const sortPayrollReportTabs = (existingTabNames: string[]): string[] => {
  const activeTabs = ACTIVE_TAB_ORDER.filter((tabName) => existingTabNames.includes(tabName));

  const archiveTabs = existingTabNames
    .filter((tabName) => !activeTabs.includes(tabName))
    .sort((a, b) => {
      const timestampComparison = parseArchiveTimestamp(b).localeCompare(parseArchiveTimestamp(a));
      if (timestampComparison !== 0) return timestampComparison;
      return a.localeCompare(b);
    });

  return [...activeTabs, ...archiveTabs];
};

export default sortPayrollReportTabs;
