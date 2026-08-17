const activityReorderUpdate = {
  ActivityReorderUpdate: {
    type: 'object',
    properties: {
      activityId: { type: 'string', format: 'uuid' },
      groupLabel: { type: 'string', nullable: true, example: 'VT Grows' },
      sortOrder: { type: 'number', example: 0 },
    },
  },
};

export default activityReorderUpdate;
