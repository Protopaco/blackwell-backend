const payPeriodConfigSnapshot = {
  PayPeriodConfigSnapshot: {
    type: 'object',
    properties: {
      employees: {
        type: 'array',
        items: { $ref: '#/components/schemas/Employee' },
      },
      activities: {
        type: 'array',
        items: { $ref: '#/components/schemas/Activity' },
      },
      fundingSources: {
        type: 'array',
        items: { $ref: '#/components/schemas/FundingSource' },
      },
      holidays: {
        type: 'array',
        items: { $ref: '#/components/schemas/Holiday' },
      },
      settings: { $ref: '#/components/schemas/Settings' },
    },
  },
};

export default payPeriodConfigSnapshot;
