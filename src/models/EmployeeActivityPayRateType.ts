const EmployeeActivityPayRateType = {
  Hourly: 'Hourly',
  FlatRate: 'FlatRate',
  Salary: 'Salary',
} as const;

type EmployeeActivityPayRateType = typeof EmployeeActivityPayRateType[keyof typeof EmployeeActivityPayRateType];

export { EmployeeActivityPayRateType };
export type { EmployeeActivityPayRateType as EmployeeActivityPayRateTypeType };
