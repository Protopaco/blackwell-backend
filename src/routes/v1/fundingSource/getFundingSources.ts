import { Router, Request, Response } from 'express';
import getFundingSourcesService from '#services/fundingSource/getFundingSources.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/fundingSource/{clientId}:
 *   get:
 *     operationId: v1GetFundingSources
 *     summary: Get all funding sources for a client
 *     tags:
 *       - FundingSource
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of funding sources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FundingSource'
 *       404:
 *         description: Client not found
 */
router.get('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  logger.info(`GET /fundingSource/${clientId} — request`);

  const fundingSources = await getFundingSourcesService(clientId);

  logger.info(`GET /fundingSource/${clientId} — response 200 count=${fundingSources.length}`);
  return res.status(200).json(fundingSources);
});

export default router;
