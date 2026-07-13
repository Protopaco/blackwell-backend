const clientUpdateRequest = {
  ClientUpdateRequest: {
    type: 'object',
    description: 'All fields optional — only send what is actually changing.',
    properties: {
      status: { type: 'string', enum: ['Active', 'Inactive'] },
      clientName: { type: 'string' },
      clientCode: { type: 'string' },
    },
  },
};

export default clientUpdateRequest;
