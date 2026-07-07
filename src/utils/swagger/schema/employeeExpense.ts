const employeeExpense = {
  EmployeeExpense: {
    type: 'object',
    properties: {
      employeeId: { type: 'string', format: 'uuid' },
      employeeName: { type: 'string', example: 'Jane Smith' },
      activeThisPayPeriod: { type: 'boolean' },
      totalExpense: { type: 'number', nullable: true, example: 2326.92 },
    },
  },
};

export default employeeExpense;
