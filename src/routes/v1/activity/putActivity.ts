import { Router, Request, Response } from 'express';
import updateActivityService from '#services/activity/updateActivity.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/activity/{clientId}/{activityId}:
 *   put:
 *     operationId: v1UpdateActivity
 *     summary: Update an existing activity
 *     description: activityId is taken from the path — ignored if present in the request body. fundingSources cannot have more than 3 entries, and the last entry's percentage is always overwritten with the remainder needed to make the total exactly 100.
 *     tags:
 *       - Activity
 *     parameters:
 *       - in: path
 *         name: clientId
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
 *         description: Activity updated
 *       404:
 *         description: Client or activity not found
 *       422:
 *         description: More than 3 funding sources were provided
 */
router.put('/:clientId/:activityId', async (req: Request, res: Response) => {
  const { clientId, activityId } = req.params as { clientId: string; activityId: string };
  const activity = req.body;
  logger.info(`PUT /activity/${clientId}/${activityId} — request`);

  await updateActivityService(clientId, { ...activity, activityId });

  logger.info(`PUT /activity/${clientId}/${activityId} — response 200`);
  return res.status(200).json({ message: 'Activity updated' });
});

export default router;
