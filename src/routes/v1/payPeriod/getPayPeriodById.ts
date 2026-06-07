import { Router, Request, Response } from "express";
import getPayPeriodByIdService from "#services/payPeriod/getPayPeriodById.js";
import { logger } from "#utils/logger.js";

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{payPeriodId}:
 *   get:
 *     operationId: v1GetPayPeriodById
 *     summary: Get a single pay period by ID
 *     tags:
 *       - PayPeriod
 *     parameters:
 *       - in: path
 *         name: payPeriodId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pay period
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PayPeriod'
 */
router.get("/:payPeriodId", async (req: Request, res: Response) => {
  const { payPeriodId } = req.params as { payPeriodId: string };
  const { clientId } = req.query as { clientId: string };
  logger.info(`GET /payPeriod/${payPeriodId} — request clientId=${clientId}`);

  const payPeriod = await getPayPeriodByIdService(clientId, payPeriodId);
  if (!payPeriod) {
    logger.info(`GET /payPeriod/${payPeriodId} — response 404`);
    return res.status(404).json({ error: 'not_found', message: 'Pay period not found' });
  }

  logger.info(`GET /payPeriod/${payPeriodId} — response 200`);
  return res.status(200).json(payPeriod);
});

export default router;
