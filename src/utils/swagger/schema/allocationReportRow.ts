const allocationReportRow = {
  AllocationReportRow: {
    type: 'object',
    properties: {
      fundingSourceName: { type: 'string', example: 'Federal Grant' },
      hoursAllocation: { type: 'number', example: 320.5 },
      wagesAllocation: { type: 'number', example: 14250.00 },
      fringeAllocation: { type: 'number', example: 4560.00 },
      additionalExpenses: { type: 'number', example: 1843.75 },
      total: { type: 'number', example: 17250.25 },
    },
  },
};

export default allocationReportRow;
