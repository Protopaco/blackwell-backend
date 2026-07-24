import { Router, Request, Response } from 'express';
import removeActivityFromPayPeriodService from '#services/payPeriod/removeActivityFromPayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{clientId}/{payPeriodId}/activity/{activityId}:
 *   delete:
 *     operationId: v1RemoveActivityFromPayPeriod
 *     summary: Remove an activity from a pay period
 *     description: >
 *       Deletes the activity from this pay period's snapshot. Blocked once the first timesheet has been
 *       generated for this pay period.
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
 *       200:
 *         description: Activity removed from pay period
 *       404:
 *         description: Client, pay period, or activity not found on this pay period
 *       422:
 *         description: A timesheet has already been generated for this pay period
 */
router.delete('/:clientId/:payPeriodId/activity/:activityId', async (req: Request, res: Response) => {
  const { clientId, payPeriodId, activityId } = req.params as { clientId: string; payPeriodId: string; activityId: string };
  logger.info(`DELETE /payPeriod/${clientId}/${payPeriodId}/activity/${activityId} — request`);

  await removeActivityFromPayPeriodService(clientId, payPeriodId, activityId);

  logger.info(`DELETE /payPeriod/${clientId}/${payPeriodId}/activity/${activityId} — response 200`);
  return res.status(200).json({ message: 'Activity removed from pay period' });
});

export default router;
