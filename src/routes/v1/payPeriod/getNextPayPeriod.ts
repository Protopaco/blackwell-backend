import { Router, Request, Response } from 'express';
import getNextPayPeriodService from '#services/payPeriod/getNextPayPeriod.js';
import buildPayPeriodResponse from '#services/payPeriod/buildPayPeriodResponse.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{clientId}/next:
 *   get:
 *     operationId: v1GetNextPayPeriod
 *     summary: Get suggested next pay period for a client
 *     tags:
 *       - PayPeriod
 *     parameters:
 *       - in: path
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
 *       404:
 *         description: Client not found
 */
router.get('/:clientId/next', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  logger.info(`GET /payPeriod/${clientId}/next — request`);

  const nextPayPeriod = await getNextPayPeriodService(clientId);

  logger.info(`GET /payPeriod/${clientId}/next — response 200`);
  return res.status(200).json(buildPayPeriodResponse(nextPayPeriod));
});

export default router;
