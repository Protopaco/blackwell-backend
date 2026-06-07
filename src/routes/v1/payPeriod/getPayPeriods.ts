import { Router, Request, Response } from 'express';
import getPayPeriodsService from '#services/payPeriod/getPayPeriods.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod:
 *   get:
 *     operationId: v1GetPayPeriods
 *     summary: Get all pay periods for a client
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
 *         description: List of pay periods
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PayPeriod'
 */
router.get('/', async (req: Request, res: Response) => {
  const { clientId } = req.query as { clientId: string };
  logger.info(`GET /payPeriod — request clientId=${clientId}`);

  const payPeriods = await getPayPeriodsService(clientId);
  logger.info(`GET /payPeriod — response 200 count=${payPeriods.length}`);
  return res.status(200).json(payPeriods);
});

export default router;
