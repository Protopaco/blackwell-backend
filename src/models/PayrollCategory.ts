const PayrollCategory = {
  Base: 'Base',
  ETO: 'ETO',
  PTO: 'PTO',
  STO: 'STO',
  Holiday: 'Holiday',
} as const;

type PayrollCategory = typeof PayrollCategory[keyof typeof PayrollCategory];

export { PayrollCategory };
export type { PayrollCategory as PayrollCategoryType };
