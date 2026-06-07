import { Router, Request, Response } from 'express';
import getClientById from '#services/client/getClientById.js';
import updatePayPeriodService from '#services/payPeriod/updatePayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{payPeriodId}:
 *   put:
 *     operationId: v1UpdatePayPeriod
 *     summary: Update an existing pay period
 *     tags:
 *       - PayPeriod
 *     parameters:
 *       - in: path
 *         name: payPeriodId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pay period updated
 */
router.put('/:payPeriodId', async (req: Request, res: Response) => {
  const { payPeriodId } = req.params as { payPeriodId: string };
  const { clientId, payPeriod } = req.body;
  logger.info(`PUT /payPeriod/${payPeriodId} — request clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) {
    logger.info(`PUT /payPeriod/${payPeriodId} — response 404`);
    return res.status(404).json({ error: 'not_found', message: 'Client not found' });
  }

  await updatePayPeriodService(client.payPeriodRegistryFileId, { ...payPeriod, payPeriodId });
  logger.info(`PUT /payPeriod/${payPeriodId} — response 200`);
  return res.status(200).json({ message: 'Pay period updated' });
});

export default router;
