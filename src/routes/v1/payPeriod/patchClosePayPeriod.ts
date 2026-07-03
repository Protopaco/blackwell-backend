import { Router, Request, Response } from 'express';
import closePayPeriodService from '#services/payPeriod/closePayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{payPeriodId}/close:
 *   patch:
 *     operationId: v1ClosePayPeriod
 *     summary: Close a pay period
 *     description: Sets the pay period status to Closed. No-op if already Closed.
 *     tags:
 *       - PayPeriod
 *     parameters:
 *       - in: path
 *         name: payPeriodId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientId]
 *             properties:
 *               clientId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pay period closed
 */
router.patch('/:payPeriodId/close', async (req: Request, res: Response) => {
  const { payPeriodId } = req.params as { payPeriodId: string };
  const { clientId } = req.body;
  logger.info(`PATCH /payPeriod/${payPeriodId}/close — request clientId=${clientId}`);

  await closePayPeriodService(clientId, payPeriodId);
  logger.info(`PATCH /payPeriod/${payPeriodId}/close — response 200`);
  return res.status(200).json({ message: 'Pay period closed' });
});

export default router;
