const holiday = {
  Holiday: {
    type: 'object',
    properties: {
      holidayId: { type: 'string', format: 'uuid' },
      holidayName: { type: 'string', example: 'Labor Day' },
      holidayDate: { type: 'string', format: 'date', example: '2026-09-07' },
    },
  },
};

export default holiday;
