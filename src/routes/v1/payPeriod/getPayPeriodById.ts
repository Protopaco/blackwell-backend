import { Router, Request, Response } from "express";
import getPayPeriodByIdService from "#services/payPeriod/getPayPeriodById.js";
import buildPayPeriodResponse from "#services/payPeriod/buildPayPeriodResponse.js";
import { logger } from "#utils/logger.js";

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{clientId}/{payPeriodId}:
 *   get:
 *     operationId: v1GetPayPeriodById
 *     summary: Get a single pay period by ID
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
 *         description: Pay period
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PayPeriod'
 *       404:
 *         description: Client or pay period not found
 */
router.get("/:clientId/:payPeriodId", async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  logger.info(`GET /payPeriod/${clientId}/${payPeriodId} — request`);

  const payPeriod = await getPayPeriodByIdService(clientId, payPeriodId);

  logger.info(`GET /payPeriod/${clientId}/${payPeriodId} — response 200`);
  return res.status(200).json(buildPayPeriodResponse(payPeriod));
});

export default router;
