const PayRate = {
  Base: 'Base',
  Secondary: 'Secondary',
  Holiday: 'Holiday',
  FlatRate: 'FlatRate',
} as const;

type PayRate = typeof PayRate[keyof typeof PayRate];

export { PayRate };
export type { PayRate as PayRateType };
