import { Router, Request, Response } from 'express';
import updateActivitiesBatchService from '#services/activity/updateActivitiesBatch.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/activity/{clientId}/batch:
 *   put:
 *     operationId: v1UpdateActivitiesBatch
 *     summary: Overlay groupLabel/sortOrder onto multiple activities at once
 *     description: >
 *       Reads the client's PayrollConfig once, overlays groupLabel/sortOrder onto each matching activity,
 *       and writes once. If any activityId doesn't match a known activity in the client's PayrollConfig,
 *       the entire batch is rejected and nothing is written.
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
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/ActivityReorderUpdate'
 *     responses:
 *       200:
 *         description: Activities updated
 *       404:
 *         description: Client not found
 *       422:
 *         description: One or more activityId values do not match a known activity in the client's PayrollConfig
 */
router.put('/:clientId/batch', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  const updates = req.body;
  logger.info(`PUT /activity/${clientId}/batch — request count=${updates.length}`);

  await updateActivitiesBatchService(clientId, updates);

  logger.info(`PUT /activity/${clientId}/batch — response 200`);
  return res.status(200).json({ message: 'Activities updated' });
});

export default router;
