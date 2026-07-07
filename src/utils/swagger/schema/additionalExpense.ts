const additionalExpense = {
  AdditionalExpense: {
    type: 'object',
    properties: {
      expenseName: { type: 'string', example: 'HSA' },
      amount: { type: 'number', example: 8400 },
    },
  },
};

export default additionalExpense;
