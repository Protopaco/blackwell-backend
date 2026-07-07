const AuditAction = {
  TimesheetGenerated: 'TIMESHEET_GENERATED',
  PayPeriodCreated: 'PAY_PERIOD_CREATED',
  PayPeriodUpdated: 'PAY_PERIOD_UPDATED',
  LoginSuccess: 'LOGIN_SUCCESS',
  LoginRejected: 'LOGIN_REJECTED',
} as const;

type AuditAction = typeof AuditAction[keyof typeof AuditAction];

export { AuditAction };
export type { AuditAction as AuditActionType };
