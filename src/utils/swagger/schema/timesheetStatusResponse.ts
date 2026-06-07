const timesheetStatusResponse = {
  TimesheetStatusResponse: {
    type: 'object',
    properties: {
      employeeId: { type: 'string', format: 'uuid' },
      employeeName: { type: 'string', example: 'Morgan Haynes' },
      timesheetFileId: { type: 'string' },
      status: {
        type: 'string',
        enum: ['NotGenerated', 'Generated', 'Submitted', 'Approved'],
      },
    },
  },
};

export default timesheetStatusResponse;
