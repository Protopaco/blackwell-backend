const EmployeeStatus = {
  Active: 'Active',
  Inactive: 'Inactive',
} as const;

type EmployeeStatus = typeof EmployeeStatus[keyof typeof EmployeeStatus];

export { EmployeeStatus };
export type { EmployeeStatus as EmployeeStatusType };
