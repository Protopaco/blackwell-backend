const PayPeriodStatus = {
  Draft: 'Draft',
  Pending: 'Pending',
  Open: 'Open',
  Closed: 'Closed',
} as const;

type PayPeriodStatus = typeof PayPeriodStatus[keyof typeof PayPeriodStatus];

export { PayPeriodStatus };
export type { PayPeriodStatus as PayPeriodStatusType };
