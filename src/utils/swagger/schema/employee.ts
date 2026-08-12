const employee = {
  Employee: {
    type: 'object',
    properties: {
      employeeId: { type: 'string', format: 'uuid' },
      firstName: { type: 'string', example: 'Jane' },
      lastName: { type: 'string', example: 'Smith' },
      position: { type: 'string', example: 'Program Director' },
      salaryAmount: { type: 'number', example: 0, description: 'Absence or 0 means not salaried.' },
      activityRates: { type: 'array', items: { $ref: '#/components/schemas/EmployeeActivityRate' } },
      email: { type: 'string', format: 'email', example: 'jane.smith@example.org' },
      status: { type: 'string', enum: ['Active', 'Inactive'] },
      timesheetFileId: { type: 'string', example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms' },
    },
  },
};

export default employee;
