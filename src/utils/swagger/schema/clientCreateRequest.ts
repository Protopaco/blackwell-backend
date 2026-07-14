const clientCreateRequest = {
  ClientCreateRequest: {
    type: 'object',
    required: ['clientName', 'clientCode', 'employeePayrollFolder', 'settings'],
    properties: {
      clientName: { type: 'string' },
      clientCode: { type: 'string' },
      employeePayrollFolder: {
        type: 'object',
        description:
          'Exactly one of link or createNew must be provided. rootFolderLink is required when ' +
          'createNew is true (the parent Drive folder to create it inside) and is never persisted.',
        properties: {
          link: { type: 'string', example: 'https://drive.google.com/drive/folders/1abcXYZ' },
          createNew: { type: 'boolean' },
          rootFolderLink: { type: 'string', example: 'https://drive.google.com/drive/folders/1rootXYZ' },
        },
      },
      payrollConfigFolder: {
        allOf: [{ $ref: '#/components/schemas/FolderInput' }],
        description: 'Omitted entirely means "create new" (the default) as a subfolder of employeePayrollFolder.',
      },
      payrollReportFolder: {
        allOf: [{ $ref: '#/components/schemas/FolderInput' }],
        description: 'Omitted entirely means "create new" (the default) as a subfolder of employeePayrollFolder.',
      },
      settings: { $ref: '#/components/schemas/Settings' },
    },
  },
};

export default clientCreateRequest;
