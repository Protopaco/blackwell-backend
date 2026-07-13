import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { logger } from '#utils/logger.js';
import { swaggerSpec } from '#utils/swagger/swaggerSpec.js';
import mapErrorResponse from '#middleware/mapErrorResponse.js';
import healthRoute from '#routes/v1/health/index.js';
import clientRoute from '#routes/v1/client/index.js';
import payPeriodRoute from '#routes/v1/payPeriod/index.js';
import timesheetRoute from '#routes/v1/timesheet/index.js';
import adminRoute from '#routes/v1/admin/index.js';
import payrollReportRoute from '#routes/v1/payrollReport/index.js';
import holidayRoute from '#routes/v1/holiday/index.js';
import supervisorRoute from '#routes/v1/supervisor/index.js';
import fundingSourceRoute from '#routes/v1/fundingSource/index.js';
import activityRoute from '#routes/v1/activity/index.js';
import settingsRoute from '#routes/v1/settings/index.js';
import employeeRoute from '#routes/v1/employee/index.js';

dotenv.config();

const app = express();
const basePath = '/api';

app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      process.env.FRONTEND_BASE_URL,
    ].filter(Boolean) as string[],
    credentials: true,
  }),
);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/openapi.json', (req, res) => res.json(swaggerSpec));

app.use(`${basePath}/v1/health`, healthRoute);
app.use(`${basePath}/v1/client`, clientRoute);
app.use(`${basePath}/v1/payPeriod`, payPeriodRoute);
app.use(`${basePath}/v1/timesheet`, timesheetRoute);
app.use(`${basePath}/v1/admin`, adminRoute);
app.use(`${basePath}/v1/payrollReport`, payrollReportRoute);
app.use(`${basePath}/v1/holiday`, holidayRoute);
app.use(`${basePath}/v1/supervisor`, supervisorRoute);
app.use(`${basePath}/v1/fundingSource`, fundingSourceRoute);
app.use(`${basePath}/v1/activity`, activityRoute);
app.use(`${basePath}/v1/settings`, settingsRoute);
app.use(`${basePath}/v1/employee`, employeeRoute);

app.use(mapErrorResponse);

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

const server = app.listen(PORT, HOST, () => {
  logger.info(`Blackwell Time API running at http://${HOST}:${PORT}`);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Graceful shutdown...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
