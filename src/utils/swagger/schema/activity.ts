const activity = {
  Activity: {
    type: 'object',
    properties: {
      activityId: { type: 'string', format: 'uuid' },
      activityName: { type: 'string', example: 'Job Coaching' },
      trackSeparately: { type: 'boolean' },
      payrollCategory: { type: 'string', enum: ['Regular', 'ETO', 'PTO', 'STO'] },
      fundingSources: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            fundingSourceName: { type: 'string', example: 'Federal Grant' },
            percentage: { type: 'number', example: 50 },
          },
        },
      },
      payRate: { type: 'string', enum: ['HourlyPayRate1', 'HourlyPayRate2', 'FlatPayRate1', 'FlatPayRate2'] },
      flatRateAmount: { type: 'number', example: 25 },
    },
  },
};

export default activity;
