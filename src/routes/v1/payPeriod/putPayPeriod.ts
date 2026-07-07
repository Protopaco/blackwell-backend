import { Router, Request, Response } from 'express';
import updatePayPeriodService from '#services/payPeriod/updatePayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{clientId}/{payPeriodId}:
 *   put:
 *     operationId: v1UpdatePayPeriod
 *     summary: Update an existing pay period
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
 *         description: Pay period updated
 */
router.put('/:clientId/:payPeriodId', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  const { payPeriod } = req.body;
  logger.info(`PUT /payPeriod/${clientId}/${payPeriodId} — request`);

  await updatePayPeriodService(clientId, { ...payPeriod, payPeriodId });
  logger.info(`PUT /payPeriod/${clientId}/${payPeriodId} — response 200`);
  return res.status(200).json({ message: 'Pay period updated' });
});

export default router;
