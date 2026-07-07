import { Router, Request, Response } from 'express';
import closePayPeriodService from '#services/payPeriod/closePayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{clientId}/{payPeriodId}/close:
 *   patch:
 *     operationId: v1ClosePayPeriod
 *     summary: Close a pay period
 *     description: Sets the pay period status to Closed. No-op if already Closed.
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
 *         description: Pay period closed
 */
router.patch('/:clientId/:payPeriodId/close', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  logger.info(`PATCH /payPeriod/${clientId}/${payPeriodId}/close — request`);

  await closePayPeriodService(clientId, payPeriodId);
  logger.info(`PATCH /payPeriod/${clientId}/${payPeriodId}/close — response 200`);
  return res.status(200).json({ message: 'Pay period closed' });
});

export default router;
