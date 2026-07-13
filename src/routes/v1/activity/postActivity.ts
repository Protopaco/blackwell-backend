import { Router, Request, Response } from 'express';
import createActivityService from '#services/activity/createActivity.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/activity/{clientId}:
 *   post:
 *     operationId: v1CreateActivity
 *     summary: Create a new activity
 *     description: activityId is server-generated — ignored if present in the request body. fundingSources cannot have more than 3 entries, and the last entry's percentage is always overwritten with the remainder needed to make the total exactly 100.
 *     tags:
 *       - Activity
 *     parameters:
 *       - in: path
 *         name: clientId
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
 *       201:
 *         description: Activity created
 *       404:
 *         description: Client not found
 *       422:
 *         description: More than 3 funding sources were provided
 */
router.post('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  const activity = req.body;
  logger.info(`POST /activity/${clientId} — request`);

  await createActivityService(clientId, activity);

  logger.info(`POST /activity/${clientId} — response 201`);
  return res.status(201).json({ message: 'Activity created' });
});

export default router;
