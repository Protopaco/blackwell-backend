const supervisor = {
  Supervisor: {
    type: "object",
    properties: {
      supervisorId: { type: "string", format: "uuid" },
      firstName: { type: "string", example: "Alex" },
      lastName: { type: "string", example: "Rivera" },
      email: {
        type: "string",
        format: "email",
        example: "alex.rivera@example.org",
      },
    },
  },
};

export default supervisor;
