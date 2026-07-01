const PayrollCategory = {
  Regular: 'Regular',
  ETO: 'ETO',
  PTO: 'PTO',
  STO: 'STO',
} as const;

type PayrollCategory = typeof PayrollCategory[keyof typeof PayrollCategory];

export { PayrollCategory };
export type { PayrollCategory as PayrollCategoryType };
