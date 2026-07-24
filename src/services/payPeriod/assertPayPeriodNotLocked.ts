import PayPeriod from '#models/PayPeriod.js';
import { PayPeriodStatus } from '#models/PayPeriodStatus.js';
import { UnprocessableError } from '#utils/errors.js';

// Shared "has the first timesheet been generated for this pay period" gate, reused by every
// domain (Activity, FundingSource, Holiday) whose snapshot presence/edit rights are locked at
// that cutoff (status !== Pending). `action` is a fragment describing what the caller was trying
// to do, e.g. "add an activity to this pay period".
const assertPayPeriodNotLocked = (payPeriod: PayPeriod, action: string): void => {
  if (payPeriod.status !== PayPeriodStatus.Pending) {
    throw new UnprocessableError(`Cannot ${action} — a timesheet has already been generated.`);
  }
};

export default assertPayPeriodNotLocked;
