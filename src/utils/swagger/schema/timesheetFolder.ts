const timesheetFolder = {
  TimesheetFolder: {
    type: 'object',
    properties: {
      timesheetFolderId: { type: 'string', format: 'uuid' },
      timesheetFolderName: { type: 'string', example: 'Main Office' },
      driveFolderId: { type: 'string', example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms' },
      status: { type: 'string', enum: ['Active', 'Inactive'] },
    },
  },
};

export default timesheetFolder;
