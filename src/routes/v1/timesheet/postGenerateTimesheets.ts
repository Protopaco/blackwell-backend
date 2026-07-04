import { Router, Request, Response } from 'express';
import generateTimesheetsService from '#services/timesheet/generateTimesheets.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/timesheet/{clientId}/{payPeriodId}/generate:
 *   post:
 *     operationId: v1GenerateTimesheets
 *     summary: Generate timesheets for all active employees for a pay period
 *     tags:
 *       - Timesheet
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: payPeriodId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timesheets generated
 *       404:
 *         description: Client or pay period not found
 */
router.post('/:clientId/:payPeriodId/generate', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  logger.info(`POST /timesheet/${clientId}/${payPeriodId}/generate — request`);

  await generateTimesheetsService(clientId, payPeriodId);

  logger.info(`POST /timesheet/${clientId}/${payPeriodId}/generate — response 200`);
  return res.status(200).json({ message: 'Timesheets generated' });
});

export default router;
