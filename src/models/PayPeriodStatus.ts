const PayPeriodStatus = {
  Pending: 'Pending',
  Open: 'Open',
  Processed: 'Processed',
  Allocated: 'Allocated',
  Closed: 'Closed',
} as const;

type PayPeriodStatus = typeof PayPeriodStatus[keyof typeof PayPeriodStatus];

export { PayPeriodStatus };
export type { PayPeriodStatus as PayPeriodStatusType };
