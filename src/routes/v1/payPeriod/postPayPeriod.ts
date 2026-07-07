import { Router, Request, Response } from 'express';
import createPayPeriodService from '#services/payPeriod/createPayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{clientId}:
 *   post:
 *     operationId: v1CreatePayPeriod
 *     summary: Create a new pay period
 *     tags:
 *       - PayPeriod
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Pay period created
 */
router.post('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  const { payPeriod } = req.body;
  logger.info(`POST /payPeriod/${clientId} — request`);

  await createPayPeriodService(clientId, payPeriod);
  logger.info(`POST /payPeriod/${clientId} — response 201`);
  return res.status(201).json({ message: 'Pay period created' });
});

export default router;
