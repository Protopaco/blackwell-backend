import { Router, Request, Response } from 'express';
import updateActivityOnPayPeriodService from '#services/payPeriod/updateActivityOnPayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{clientId}/{payPeriodId}/activity/{activityId}:
 *   put:
 *     operationId: v1UpdateActivityOnPayPeriod
 *     summary: Update an activity on a pay period
 *     description: >
 *       activityId is taken from the path — ignored if present in the request body. activityName,
 *       trackSeparately, payrollCategory, payRate, and flatRateAmount are locked once the first timesheet
 *       has been generated for this pay period. fundingSources percentages stay editable through
 *       Processed status and lock once the allocation report has been generated (Allocated). fundingSources
 *       cannot have more than 3 entries, and the last entry's percentage is always overwritten with the
 *       remainder needed to make the total exactly 100.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Activity'
 *     responses:
 *       200:
 *         description: Activity updated on pay period
 *       404:
 *         description: Client, pay period, or activity not found on this pay period
 *       422:
 *         description: More than 3 funding sources were provided, a referenced funding source is missing from the snapshot, or the edit is locked given the pay period's current status
 */
router.put('/:clientId/:payPeriodId/activity/:activityId', async (req: Request, res: Response) => {
  const { clientId, payPeriodId, activityId } = req.params as { clientId: string; payPeriodId: string; activityId: string };
  const activity = req.body;
  logger.info(`PUT /payPeriod/${clientId}/${payPeriodId}/activity/${activityId} — request`);

  await updateActivityOnPayPeriodService(clientId, payPeriodId, { ...activity, activityId });

  logger.info(`PUT /payPeriod/${clientId}/${payPeriodId}/activity/${activityId} — response 200`);
  return res.status(200).json({ message: 'Activity updated on pay period' });
});

export default router;
