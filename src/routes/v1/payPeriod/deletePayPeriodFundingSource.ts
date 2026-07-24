import { Router, Request, Response } from 'express';
import removeFundingSourceFromPayPeriodService from '#services/payPeriod/removeFundingSourceFromPayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{clientId}/{payPeriodId}/fundingSource/{fundingSourceId}:
 *   delete:
 *     operationId: v1RemoveFundingSourceFromPayPeriod
 *     summary: Remove a funding source from a pay period
 *     description: >
 *       Deletes the funding source from this pay period's snapshot. Blocked once the first timesheet has
 *       been generated for this pay period, or while any snapshot activity still references it.
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
 *         name: fundingSourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Funding source removed from pay period
 *       404:
 *         description: Client, pay period, or funding source not found on this pay period
 *       422:
 *         description: A timesheet has already been generated for this pay period, or the funding source is still referenced by an activity on this pay period
 */
router.delete('/:clientId/:payPeriodId/fundingSource/:fundingSourceId', async (req: Request, res: Response) => {
  const { clientId, payPeriodId, fundingSourceId } = req.params as { clientId: string; payPeriodId: string; fundingSourceId: string };
  logger.info(`DELETE /payPeriod/${clientId}/${payPeriodId}/fundingSource/${fundingSourceId} — request`);

  await removeFundingSourceFromPayPeriodService(clientId, payPeriodId, fundingSourceId);

  logger.info(`DELETE /payPeriod/${clientId}/${payPeriodId}/fundingSource/${fundingSourceId} — response 200`);
  return res.status(200).json({ message: 'Funding source removed from pay period' });
});

export default router;
