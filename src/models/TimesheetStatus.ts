const TimesheetStatus = {
  NotGenerated: 'NotGenerated',
  Generated: 'Generated',
  Submitted: 'Submitted',
  Approved: 'Approved',
  Complete: 'Complete',
} as const;

type TimesheetStatus = typeof TimesheetStatus[keyof typeof TimesheetStatus];

export { TimesheetStatus };
export type { TimesheetStatus as TimesheetStatusType };
