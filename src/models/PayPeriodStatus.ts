const PayPeriodStatus = {
  Pending: 'Pending',
  Open: 'Open',
  Processed: 'Processed',
  Closed: 'Closed',
} as const;

type PayPeriodStatus = typeof PayPeriodStatus[keyof typeof PayPeriodStatus];

export { PayPeriodStatus };
export type { PayPeriodStatus as PayPeriodStatusType };
