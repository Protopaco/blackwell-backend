import { Router, Request, Response } from 'express';
import syncHolidaysOnPayPeriodService from '#services/payPeriod/syncHolidaysOnPayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{clientId}/{payPeriodId}/holiday/sync:
 *   post:
 *     operationId: v1SyncHolidaysOnPayPeriod
 *     summary: Sync a pay period's holidays from PayrollConfig
 *     description: >
 *       Recomputes this pay period's snapshot Holidays tab from the client's current PayrollConfig,
 *       keeping only holidays whose date falls within this pay period's date range. Fully replaces the
 *       snapshot's Holidays list — a holiday deleted or moved out of range in PayrollConfig drops off the
 *       snapshot. Blocked once the first timesheet has been generated for this pay period.
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
 *     responses:
 *       200:
 *         description: Holidays synced on pay period
 *       404:
 *         description: Client or pay period not found
 *       422:
 *         description: A timesheet has already been generated for this pay period
 */
router.post('/:clientId/:payPeriodId/holiday/sync', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  logger.info(`POST /payPeriod/${clientId}/${payPeriodId}/holiday/sync — request`);

  await syncHolidaysOnPayPeriodService(clientId, payPeriodId);

  logger.info(`POST /payPeriod/${clientId}/${payPeriodId}/holiday/sync — response 200`);
  return res.status(200).json({ message: 'Holidays synced on pay period' });
});

export default router;
