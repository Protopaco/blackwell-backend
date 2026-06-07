import { Router, Request, Response } from 'express';
import generateTimesheetsService from '#services/timesheet/generateTimesheets.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/timesheet/generate:
 *   post:
 *     operationId: v1GenerateTimesheets
 *     summary: Generate timesheets for all active employees for a pay period
 *     tags:
 *       - Timesheet
 *     responses:
 *       200:
 *         description: Timesheets generated
 */
router.post('/generate', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.body;
  logger.info(`POST /timesheet/generate — request clientId=${clientId} payPeriodId=${payPeriodId}`);

  await generateTimesheetsService(clientId, payPeriodId);
  logger.info(`POST /timesheet/generate — response 200`);
  return res.status(200).json({ message: 'Timesheets generated' });
});

export default router;
