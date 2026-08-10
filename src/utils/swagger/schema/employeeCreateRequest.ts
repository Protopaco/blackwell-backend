const employeeCreateRequest = {
  EmployeeCreateRequest: {
    type: 'object',
    description: 'Exactly one of timesheetFileLink or timesheetFolderId must be provided.',
    required: ['firstName', 'lastName', 'position', 'salaryAmount', 'activityRates', 'email', 'status'],
    properties: {
      firstName: { type: 'string', example: 'Jane' },
      lastName: { type: 'string', example: 'Smith' },
      position: { type: 'string', example: 'Program Director' },
      salaryAmount: { type: 'number', example: 0, description: 'Absence or 0 means not salaried.' },
      activityRates: { type: 'array', items: { $ref: '#/components/schemas/EmployeeActivityRate' } },
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
