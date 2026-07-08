const supervisor = {
  Supervisor: {
    type: 'object',
    properties: {
      supervisorId: { type: 'string', format: 'uuid' },
      supervisorFirstName: { type: 'string', example: 'Alex' },
      supervisorLastName: { type: 'string', example: 'Rivera' },
      supervisorEmail: { type: 'string', format: 'email', example: 'alex.rivera@example.org' },
    },
  },
};

export default supervisor;
