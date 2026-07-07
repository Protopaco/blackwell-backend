const error = {
  ErrorResponse: {
    type: 'object',
    properties: {
      error: { type: 'string', example: 'not_found' },
      message: { type: 'string', example: 'The requested resource was not found' },
    },
  },
};

export default error;
