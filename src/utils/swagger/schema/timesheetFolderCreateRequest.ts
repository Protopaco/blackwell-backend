const timesheetFolderCreateRequest = {
  TimesheetFolderCreateRequest: {
    type: 'object',
    required: ['timesheetFolderName', 'driveFolderLink'],
    properties: {
      timesheetFolderName: { type: 'string', example: 'Main Office' },
      driveFolderLink: { type: 'string', example: 'https://drive.google.com/drive/folders/1abcXYZ' },
    },
  },
};

export default timesheetFolderCreateRequest;
