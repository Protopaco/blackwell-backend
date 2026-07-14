import { Router, Request, Response } from 'express';
import getActivitiesService from '#services/activity/getActivities.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/activity/{clientId}:
 *   get:
 *     operationId: v1GetActivities
 *     summary: Get all activities for a client
 *     tags:
 *       - Activity
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Client not found
 */
router.get('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  logger.info(`GET /activity/${clientId} — request`);

  const activities = await getActivitiesService(clientId);

  logger.info(`GET /activity/${clientId} — response 200 count=${activities.length}`);
  return res.status(200).json(activities);
});

export default router;
