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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - payPeriodId
 *             properties:
 *               clientId:
 *                 type: string
 *               payPeriodId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Timesheets generated
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Client or pay period not found
 */
router.post('/generate', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.body;
  logger.info(`POST /timesheet/generate — request clientId=${clientId} payPeriodId=${payPeriodId}`);

  if (!clientId || !payPeriodId) {
    return res.status(400).json({ error: 'bad_request', message: 'clientId and payPeriodId are required' });
  }

  try {
    await generateTimesheetsService(clientId, payPeriodId);
  } catch (error: any) {
    const ourNotFoundMessages = ['Client not found', 'Pay period not found'];
    if (ourNotFoundMessages.some((msg) => error?.message?.startsWith(msg))) {
      logger.info(`POST /timesheet/generate — response 404: ${error.message}`);
      return res.status(404).json({ error: 'not_found', message: error.message });
    }
    throw error;
  }

  logger.info(`POST /timesheet/generate — response 200`);
  return res.status(200).json({ message: 'Timesheets generated' });
});

export default router;
