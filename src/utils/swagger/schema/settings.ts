const settings = {
  Settings: {
    type: 'object',
    required: ['timeInputMethod', 'payPeriodInterval', 'payPeriodStartDate'],
    properties: {
      timeInputMethod: { type: 'string', enum: ['TotalHours', 'ClockInOut'] },
      payPeriodInterval: { type: 'string', enum: ['Weekly', 'Bi-Weekly', 'Monthly'] },
      payPeriodStartDate: { type: 'string', format: 'date', example: '2026-01-05' },
    },
  },
};

export default settings;
