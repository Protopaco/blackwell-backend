import { Router, Request, Response } from 'express';
import addActivityToPayPeriodService from '#services/payPeriod/addActivityToPayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{clientId}/{payPeriodId}/activity/{activityId}:
 *   post:
 *     operationId: v1AddActivityToPayPeriod
 *     summary: Add an activity to a pay period
 *     description: >
 *       Copies the activity's current row from the client's PayrollConfig into this pay period's report
 *       workbook snapshot. Blocked once the first timesheet has been generated for this pay period. The
 *       activity's funding sources must already exist on this pay period's snapshot.
 *     tags:
 *       - PayPeriod
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
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Activity added to pay period
 *       404:
 *         description: Client, pay period, or activity not found
 *       422:
 *         description: A timesheet has already been generated, the activity is already on this pay period, or a referenced funding source is missing from the snapshot
 */
router.post('/:clientId/:payPeriodId/activity/:activityId', async (req: Request, res: Response) => {
  const { clientId, payPeriodId, activityId } = req.params as { clientId: string; payPeriodId: string; activityId: string };
  logger.info(`POST /payPeriod/${clientId}/${payPeriodId}/activity/${activityId} — request`);

  await addActivityToPayPeriodService(clientId, payPeriodId, activityId);

  logger.info(`POST /payPeriod/${clientId}/${payPeriodId}/activity/${activityId} — response 201`);
  return res.status(201).json({ message: 'Activity added to pay period' });
});

export default router;
