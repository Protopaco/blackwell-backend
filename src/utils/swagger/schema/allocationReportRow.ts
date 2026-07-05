const allocationReportRow = {
  AllocationReportRow: {
    type: 'object',
    properties: {
      fundingSourceName: { type: 'string', example: 'Federal Grant' },
      wagesAllocation: { type: 'number', example: 14250.00 },
      additionalExpenses: { type: 'number', example: 1843.75 },
      total: { type: 'number', example: 16093.75 },
    },
  },
};

export default allocationReportRow;
