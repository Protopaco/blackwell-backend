const employeeCreateRequest = {
  EmployeeCreateRequest: {
    type: 'object',
    description: 'Exactly one of timesheetFileLink or timesheetFolderId must be provided.',
    required: ['firstName', 'lastName', 'position', 'hourlyPayRate1', 'hourlyPayRate2', 'holidayPayRate', 'email', 'status'],
    properties: {
      firstName: { type: 'string', example: 'Jane' },
      lastName: { type: 'string', example: 'Smith' },
      position: { type: 'string', example: 'Program Director' },
      hourlyPayRate1: { type: 'number', example: 25.96 },
      hourlyPayRate2: { type: 'number', example: 36.00 },
      holidayPayRate: { type: 'number', example: 38.94 },
      email: { type: 'string', format: 'email', example: 'jane.smith@example.org' },
      status: { type: 'string', enum: ['Active', 'Inactive'] },
      timesheetFileLink: {
        type: 'string',
        example: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit',
      },
      timesheetFolderId: { type: 'string', format: 'uuid' },
    },
  },
};

export default employeeCreateRequest;
