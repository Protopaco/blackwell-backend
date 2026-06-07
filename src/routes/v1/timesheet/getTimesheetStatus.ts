import { Router, Request, Response } from 'express';
import getTimesheetStatusesService from '#services/timesheet/getTimesheetStatuses.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/timesheet/status:
 *   get:
 *     operationId: v1GetTimesheetStatus
 *     summary: Get timesheet status for all employees for a pay period
 *     tags:
 *       - Timesheet
 *     parameters:
 *       - in: query
 *         name: payPeriodId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timesheet status per employee
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TimesheetStatusResponse'
 */
router.get('/status', async (req: Request, res: Response) => {
  const { payPeriodId, clientId } = req.query as { payPeriodId: string; clientId: string };
  logger.info(`GET /timesheet/status — request payPeriodId=${payPeriodId} clientId=${clientId}`);

  const statuses = await getTimesheetStatusesService(clientId, payPeriodId);
  if (!statuses) {
    logger.info('GET /timesheet/status — response 404');
    return res.status(404).json({ error: 'not_found', message: 'Pay period not found' });
  }

  logger.info(`GET /timesheet/status — response 200 count=${statuses.length}`);
  return res.status(200).json(statuses);
});

export default router;
