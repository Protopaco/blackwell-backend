const timesheetStatusResponse = {
  EmployeeTimesheetStatus: {
    type: 'object',
    properties: {
      employeeId: { type: 'string', format: 'uuid' },
      employeeName: { type: 'string', example: 'Morgan Haynes' },
      timesheetFileId: { type: 'string' },
      totalHours: { type: 'number', nullable: true, example: 72.5 },
      flatRateQuantity: { type: 'number', nullable: true, example: 2 },
      employeeSigned: { type: 'boolean' },
      supervisorSigned: { type: 'boolean' },
      status: { type: 'string', enum: ['NotGenerated', 'Generated', 'Submitted', 'Approved', 'Complete'] },
    },
  },
};

export default timesheetStatusResponse;
