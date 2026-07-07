const payPeriod = {
  PayPeriod: {
    type: 'object',
    properties: {
      payPeriodId: { type: 'string', format: 'uuid' },
      payPeriodName: { type: 'string', example: '06/01 - 06/14' },
      status: { type: 'string', enum: ['Pending', 'Open', 'Processed', 'Closed'] },
      startDate: { type: 'string', format: 'date', example: '2026-06-01' },
      endDate: { type: 'string', format: 'date', example: '2026-06-14' },
      createdDate: { type: 'string', format: 'date' },
    },
  },
};

export default payPeriod;
