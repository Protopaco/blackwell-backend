const employee = {
  Employee: {
    type: 'object',
    properties: {
      employeeId: { type: 'string', format: 'uuid' },
      firstName: { type: 'string', example: 'Jane' },
      lastName: { type: 'string', example: 'Smith' },
      position: { type: 'string', example: 'Program Director' },
      hourlyPayRate1: { type: 'number', example: 25.96 },
      hourlyPayRate2: { type: 'number', example: 36.00 },
      holidayPayRate: { type: 'number', example: 38.94 },
      email: { type: 'string', format: 'email', example: 'jane.smith@example.org' },
      status: { type: 'string', enum: ['Active', 'Inactive'] },
      timesheetFileId: { type: 'string', example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms' },
      timesheetFileLink: { type: 'string', format: 'uri', example: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit' },
    },
  },
};

export default employee;
