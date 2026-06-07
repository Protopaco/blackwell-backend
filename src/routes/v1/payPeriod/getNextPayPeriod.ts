import { Router, Request, Response } from 'express';
import getNextPayPeriodService from '#services/payPeriod/getNextPayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/next:
 *   get:
 *     operationId: v1GetNextPayPeriod
 *     summary: Get suggested next pay period for a client
 *     tags:
 *       - PayPeriod
 *     parameters:
 *       - in: query
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Suggested next pay period
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PayPeriod'
 */
router.get('/next', async (req: Request, res: Response) => {
  const { clientId } = req.query as { clientId: string };
  logger.info(`GET /payPeriod/next — request clientId=${clientId}`);

  const nextPayPeriod = await getNextPayPeriodService(clientId);
  if (!nextPayPeriod) {
    logger.info('GET /payPeriod/next — response 404');
    return res.status(404).json({ error: 'not_found', message: 'Client not found' });
  }

  logger.info('GET /payPeriod/next — response 200');
  return res.status(200).json(nextPayPeriod);
});

export default router;
