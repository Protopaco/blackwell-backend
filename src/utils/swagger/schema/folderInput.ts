const folderInput = {
  FolderInput: {
    type: 'object',
    description: 'Exactly one of link or createNew must be provided.',
    properties: {
      link: { type: 'string', example: 'https://drive.google.com/drive/folders/1abcXYZ' },
      createNew: { type: 'boolean' },
    },
  },
};

export default folderInput;
