import { Router, Request, Response } from 'express';
import deleteActivityService from '#services/activity/deleteActivity.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/activity/{clientId}/{activityId}:
 *   delete:
 *     operationId: v1DeleteActivity
 *     summary: Delete an activity
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
 *     responses:
 *       200:
 *         description: Activity deleted
 *       404:
 *         description: Client or activity not found
 */
router.delete('/:clientId/:activityId', async (req: Request, res: Response) => {
  const { clientId, activityId } = req.params as { clientId: string; activityId: string };
  logger.info(`DELETE /activity/${clientId}/${activityId} — request`);

  await deleteActivityService(clientId, activityId);

  logger.info(`DELETE /activity/${clientId}/${activityId} — response 200`);
  return res.status(200).json({ message: 'Activity deleted' });
});

export default router;
