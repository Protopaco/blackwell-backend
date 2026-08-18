const activity = {
  Activity: {
    type: 'object',
    properties: {
      activityId: { type: 'string', format: 'uuid' },
      activityName: { type: 'string', example: 'Job Coaching' },
      payrollCategory: { type: 'string', enum: ['Regular', 'ETO', 'PTO', 'STO'] },
      groupLabel: { type: 'string', nullable: true, example: 'VT Grows' },
      sortOrder: { type: 'number', example: 0 },
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
    },
  },
};

export default activity;
