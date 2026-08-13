const employeeExpenseUpdate = {
  EmployeeExpenseUpdate: {
    type: 'object',
    properties: {
      employeeId: { type: 'string', format: 'uuid' },
      wageExpense: { type: 'number', nullable: true, example: 2326.92 },
      taxExpense: { type: 'number', nullable: true, example: 189.45 },
    },
  },
};

export default employeeExpenseUpdate;
