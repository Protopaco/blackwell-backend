const employeeExpense = {
  EmployeeExpense: {
    type: 'object',
    properties: {
      employeeId: { type: 'string', format: 'uuid' },
      employeeName: { type: 'string', example: 'Jane Smith' },
      wageExpense: { type: 'number', nullable: true, example: 2326.92 },
      taxExpense: { type: 'number', nullable: true, example: 189.45 },
    },
  },
};

export default employeeExpense;
