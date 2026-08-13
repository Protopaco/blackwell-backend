const allocationReportRow = {
  AllocationReportRow: {
    type: 'object',
    properties: {
      fundingSourceName: { type: 'string', example: 'Federal Grant' },
      wagesAllocation: { type: 'number', example: 14250.00 },
      taxesAllocation: { type: 'number', example: 1156.50 },
      additionalExpenses: { type: 'number', example: 1843.75 },
      total: { type: 'number', example: 17250.25 },
    },
  },
};

export default allocationReportRow;
