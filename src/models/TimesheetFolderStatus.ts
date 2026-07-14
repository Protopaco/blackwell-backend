const TimesheetFolderStatus = {
  Active: 'Active',
  Inactive: 'Inactive',
} as const;

type TimesheetFolderStatus = typeof TimesheetFolderStatus[keyof typeof TimesheetFolderStatus];

export { TimesheetFolderStatus };
export type { TimesheetFolderStatus as TimesheetFolderStatusType };
