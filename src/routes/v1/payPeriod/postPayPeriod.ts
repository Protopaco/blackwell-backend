import { Router, Request, Response } from 'express';
import createPayPeriodService from '#services/payPeriod/createPayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod:
 *   post:
 *     operationId: v1CreatePayPeriod
 *     summary: Create a new pay period
 *     tags:
 *       - PayPeriod
 *     responses:
 *       201:
 *         description: Pay period created
 */
router.post('/', async (req: Request, res: Response) => {
  const { clientId, payPeriod } = req.body;
  logger.info(`POST /payPeriod — request clientId=${clientId}`);

  await createPayPeriodService(clientId, payPeriod);
  logger.info('POST /payPeriod — response 201');
  return res.status(201).json({ message: 'Pay period created' });
});

export default router;
