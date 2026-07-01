const PayRate = {
  Base: 'Base',
  Secondary: 'Secondary',
  FlatRate1: 'FlatRate1',
  FlatRate2: 'FlatRate2',
} as const;

type PayRate = typeof PayRate[keyof typeof PayRate];

const isFlatRate = (payRate: PayRate): boolean =>
  payRate === PayRate.FlatRate1 || payRate === PayRate.FlatRate2;

export { PayRate, isFlatRate };
export type { PayRate as PayRateType };
