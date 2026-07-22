const clientSummary = {
  ClientSummary: {
    type: 'object',
    properties: {
      employees: {
        type: 'array',
        items: { $ref: '#/components/schemas/Employee' },
      },
      supervisors: {
        type: 'array',
        items: { $ref: '#/components/schemas/Supervisor' },
      },
      activities: {
        type: 'array',
        items: { $ref: '#/components/schemas/Activity' },
      },
      fundingSources: {
        type: 'array',
        items: { $ref: '#/components/schemas/FundingSource' },
      },
      holidays: {
        type: 'array',
        items: { $ref: '#/components/schemas/Holiday' },
      },
      timesheetFolders: {
        type: 'array',
        items: { $ref: '#/components/schemas/TimesheetFolder' },
      },
      settings: { $ref: '#/components/schemas/Settings' },
      payPeriods: {
        type: 'array',
        items: { $ref: '#/components/schemas/PayPeriod' },
      },
    },
  },
};

export default clientSummary;
