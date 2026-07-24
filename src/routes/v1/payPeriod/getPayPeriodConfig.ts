import { Router, Request, Response } from 'express';
import getPayPeriodConfigService from '#services/payPeriod/getPayPeriodConfig.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{clientId}/{payPeriodId}/config:
 *   get:
 *     operationId: v1GetPayPeriodConfig
 *     summary: Get a pay period's full config snapshot (employees, activities, funding sources, holidays, settings)
 *     description: >
 *       One batched read across the pay period's snapshot tabs, backing the Employees/Activities/
 *       FundingSources/Holidays tabs on the Pay Period page.
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
 *         description: Pay period config snapshot
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PayPeriodConfigSnapshot'
 *       404:
 *         description: Client or pay period not found
 */
router.get('/:clientId/:payPeriodId/config', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  logger.info(`GET /payPeriod/${clientId}/${payPeriodId}/config — request`);

  const payPeriodConfig = await getPayPeriodConfigService(clientId, payPeriodId);

  logger.info(`GET /payPeriod/${clientId}/${payPeriodId}/config — response 200`);
  return res.status(200).json(payPeriodConfig);
});

export default router;
