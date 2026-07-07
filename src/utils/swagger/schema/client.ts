const client = {
  Client: {
    type: 'object',
    properties: {
      clientId: { type: 'string', format: 'uuid' },
      clientName: { type: 'string' },
      clientCode: { type: 'string' },
      trackFundingSource: { type: 'boolean' },
      clientFolderLink: { type: 'string' },
      clientFolderId: { type: 'string' },
      employeePayrollFolderId: { type: 'string' },
      payrollConfigFolderId: { type: 'string' },
      reportsFolderId: { type: 'string' },
      payrollReportFolderId: { type: 'string' },
      timesheetsFolderId: { type: 'string' },
      payrollConfigFileId: { type: 'string' },
      payPeriodRegistryFileId: { type: 'string' },
    },
  },
};

export default client;
