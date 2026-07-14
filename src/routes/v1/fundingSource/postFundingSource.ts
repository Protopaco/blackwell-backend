import { Router, Request, Response } from 'express';
import createFundingSourceService from '#services/fundingSource/createFundingSource.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/fundingSource/{clientId}:
 *   post:
 *     operationId: v1CreateFundingSource
 *     summary: Create a new funding source
 *     description: fundingSourceId is server-generated — ignored if present in the request body.
 *     tags:
 *       - FundingSource
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FundingSource'
 *     responses:
 *       201:
 *         description: Funding source created
 *       404:
 *         description: Client not found
 */
router.post('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  const fundingSource = req.body;
  logger.info(`POST /fundingSource/${clientId} — request`);

  await createFundingSourceService(clientId, fundingSource);

  logger.info(`POST /fundingSource/${clientId} — response 201`);
  return res.status(201).json({ message: 'Funding source created' });
});

export default router;
