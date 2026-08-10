const employeeActivityRate = {
  EmployeeActivityRate: {
    type: 'object',
    description: 'id is omitted for a newly-added row that hasn\'t been saved yet.',
    required: ['activityId', 'payRateType', 'payRate', 'holidayPayRate'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      activityId: { type: 'string', format: 'uuid' },
      payRateType: { type: 'string', enum: ['Hourly', 'FlatRate', 'Salary'] },
      payRate: { type: 'number', example: 25.96 },
      holidayPayRate: { type: 'number', example: 38.94 },
    },
  },
};

export default employeeActivityRate;
