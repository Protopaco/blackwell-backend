const client = {
  Client: {
    type: 'object',
    properties: {
      clientId: { type: 'string', format: 'uuid' },
      clientName: { type: 'string' },
      clientCode: { type: 'string' },
      status: { type: 'string', enum: ['Active', 'Inactive'] },
      employeePayrollFolderId: { type: 'string' },
      payrollConfigFolderId: { type: 'string' },
      payrollReportFolderId: { type: 'string' },
      timesheetsFolderId: { type: 'string', nullable: true },
      payrollConfigFileId: { type: 'string' },
      payPeriodRegistryFileId: { type: 'string' },
    },
  },
};

export default client;
