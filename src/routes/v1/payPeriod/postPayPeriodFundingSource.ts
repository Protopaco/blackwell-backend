import { Router, Request, Response } from 'express';
import addFundingSourceToPayPeriodService from '#services/payPeriod/addFundingSourceToPayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{clientId}/{payPeriodId}/fundingSource/{fundingSourceId}:
 *   post:
 *     operationId: v1AddFundingSourceToPayPeriod
 *     summary: Add a funding source to a pay period
 *     description: >
 *       Copies the funding source's current row from the client's PayrollConfig into this pay period's
 *       report workbook snapshot. Blocked once the first timesheet has been generated for this pay period.
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
 *       201:
 *         description: Funding source added to pay period
 *       404:
 *         description: Client, pay period, or funding source not found
 *       422:
 *         description: A timesheet has already been generated, or the funding source is already on this pay period
 */
router.post('/:clientId/:payPeriodId/fundingSource/:fundingSourceId', async (req: Request, res: Response) => {
  const { clientId, payPeriodId, fundingSourceId } = req.params as { clientId: string; payPeriodId: string; fundingSourceId: string };
  logger.info(`POST /payPeriod/${clientId}/${payPeriodId}/fundingSource/${fundingSourceId} — request`);

  await addFundingSourceToPayPeriodService(clientId, payPeriodId, fundingSourceId);

  logger.info(`POST /payPeriod/${clientId}/${payPeriodId}/fundingSource/${fundingSourceId} — response 201`);
  return res.status(201).json({ message: 'Funding source added to pay period' });
});

export default router;
