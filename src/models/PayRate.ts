const PayRate = {
  Base: 'Base',
  Secondary: 'Secondary',
  FlatRate: 'FlatRate',
} as const;

type PayRate = typeof PayRate[keyof typeof PayRate];

export { PayRate };
export type { PayRate as PayRateType };
