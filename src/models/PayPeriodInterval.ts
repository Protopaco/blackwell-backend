const PayPeriodInterval = {
  Weekly: 'Weekly',
  BiWeekly: 'Bi-Weekly',
  Monthly: 'Monthly',
} as const;

type PayPeriodInterval = typeof PayPeriodInterval[keyof typeof PayPeriodInterval];

export { PayPeriodInterval };
export type { PayPeriodInterval as PayPeriodIntervalType };
