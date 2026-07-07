const fundingSource = {
  FundingSource: {
    type: 'object',
    properties: {
      fundingSourceId: { type: 'string', format: 'uuid' },
      fundingSourceName: { type: 'string', example: 'Federal Grant' },
      fundingSourceCode: { type: 'string', example: 'FG-100' },
    },
  },
};

export default fundingSource;
