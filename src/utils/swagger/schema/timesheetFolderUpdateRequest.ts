const timesheetFolderUpdateRequest = {
  TimesheetFolderUpdateRequest: {
    type: 'object',
    description: 'All fields optional — only send what is actually changing.',
    properties: {
      timesheetFolderName: { type: 'string', example: 'Main Office' },
      driveFolderLink: { type: 'string', example: 'https://drive.google.com/drive/folders/1abcXYZ' },
      status: { type: 'string', enum: ['Active', 'Inactive'] },
    },
  },
};

export default timesheetFolderUpdateRequest;
