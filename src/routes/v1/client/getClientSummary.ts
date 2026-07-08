import { Router, Request, Response } from "express";
import getClientSummaryService from "#services/client/getClientSummary.js";
import { logger } from "#utils/logger.js";

const router = Router();

/**
 * @swagger
 * /api/v1/client/{clientId}/summary:
 *   get:
 *     operationId: v1GetClientSummary
 *     summary: Get a summary of a client's payroll config (employees, supervisors, activities, funding sources, holidays, settings)
 *     tags:
 *       - Client
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientSummary'
 *       404:
 *         description: Client not found
 */
router.get("/:clientId/summary", async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  logger.info(`GET /client/${clientId}/summary — request`);

  const clientSummary = await getClientSummaryService(clientId);

  logger.info(`GET /client/${clientId}/summary — response 200`);
  res.status(200).json(clientSummary);
});

export default router;
