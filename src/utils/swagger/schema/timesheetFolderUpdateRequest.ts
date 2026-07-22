const timesheetFolderUpdateRequest = {
  TimesheetFolderUpdateRequest: {
    type: 'object',
    description:
      'All fields optional — only send what is actually changing. Drive folder links are immutable after creation.',
    properties: {
      timesheetFolderName: { type: 'string', example: 'Main Office' },
      status: { type: 'string', enum: ['Active', 'Inactive'] },
    },
  },
};

export default timesheetFolderUpdateRequest;
