import PayPeriod from '#models/PayPeriod.js';
import { MANIFEST_TAB } from '#config/constants.js';

// Orders a timesheet workbook's tabs: pay period tabs newest-first (by the real PayPeriod.startDate, not
// by parsing the payPeriodName display string), with _manifest (internal bookkeeping, never shown to
// users) pinned last. Any tab that doesn't match a known pay period keeps its existing relative order,
// placed after the matched pay period tabs and before _manifest.
const sortTimesheetTabs = (existingTabNames: string[], payPeriods: PayPeriod[]): string[] => {
  const startDateByTabName = new Map(payPeriods.map((payPeriod) => [payPeriod.payPeriodName, payPeriod.startDate]));

  const manifestTabs = existingTabNames.filter((tabName) => tabName === MANIFEST_TAB);
  const remainingTabs = existingTabNames.filter((tabName) => tabName !== MANIFEST_TAB);

  const matchedTabs = remainingTabs.filter((tabName) => startDateByTabName.has(tabName));
  const unmatchedTabs = remainingTabs.filter((tabName) => !startDateByTabName.has(tabName));

  matchedTabs.sort((a, b) => startDateByTabName.get(b)!.localeCompare(startDateByTabName.get(a)!));

  return [...matchedTabs, ...unmatchedTabs, ...manifestTabs];
};

export default sortTimesheetTabs;
