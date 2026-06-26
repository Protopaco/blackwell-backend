import { Router, Request, Response } from 'express';
import getTimesheetStatusesService from '#services/timesheet/getTimesheetStatuses.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/timesheet/status/{clientId}/{payPeriodId}:
 *   get:
 *     operationId: v1GetTimesheetStatus
 *     summary: Get timesheet status for all active employees for a pay period
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
 *         description: Per-employee timesheet status including hours and signature state
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EmployeeTimesheetStatus'
 *       404:
 *         description: Pay period not found
 */
router.get('/status/:clientId/:payPeriodId', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  logger.info(`GET /timesheet/status/${clientId}/${payPeriodId}`);

  const statuses = await getTimesheetStatusesService(clientId, payPeriodId);
  if (!statuses) {
    logger.info(`GET /timesheet/status — response 404`);
    return res.status(404).json({ error: 'not_found', message: 'Pay period not found' });
  }

  logger.info(`GET /timesheet/status — response 200 count=${statuses.length}`);
  return res.status(200).json(statuses);
});

export default router;
