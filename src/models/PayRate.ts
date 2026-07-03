const PayRate = {
  HourlyPayRate1: 'HourlyPayRate1',
  HourlyPayRate2: 'HourlyPayRate2',
  FlatPayRate1: 'FlatPayRate1',
  FlatPayRate2: 'FlatPayRate2',
} as const;

type PayRate = typeof PayRate[keyof typeof PayRate];

const isFlatRate = (payRate: PayRate): boolean =>
  payRate === PayRate.FlatPayRate1 || payRate === PayRate.FlatPayRate2;

export { PayRate, isFlatRate };
export type { PayRate as PayRateType };
