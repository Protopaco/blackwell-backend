import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';
import schemas from './schema/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blackwell Time API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    // Controls Swagger UI's group display order — Swagger UI does not sort tags automatically,
    // it displays them in this declared order. Keep alphabetical; add new resources in place.
    tags: [
      { name: 'Activity' },
      { name: 'Admin' },
      { name: 'Client' },
      { name: 'Employee' },
      { name: 'FundingSource' },
      { name: 'Health' },
      { name: 'Holiday' },
      { name: 'PayPeriod' },
      { name: 'PayrollReport' },
      { name: 'Settings' },
      { name: 'Supervisor' },
      { name: 'Timesheet' },
      { name: 'TimesheetFolder' },
    ],
    components: {
      schemas,
    },
  },
  apis: [
    path.join(__dirname, '../../routes/v1/**/*.js'),
    path.join(__dirname, '../../routes/v1/*.js'),
    path.join(__dirname, '../../routes/v1/**/*.ts'),
    path.join(__dirname, '../../routes/v1/*.ts'),
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export { swaggerOptions, swaggerSpec };
