const employeeExpenseUpdate = {
  EmployeeExpenseUpdate: {
    type: 'object',
    properties: {
      employeeId: { type: 'string', format: 'uuid' },
      totalExpense: { type: 'number', nullable: true, example: 2326.92 },
    },
  },
};

export default employeeExpenseUpdate;
