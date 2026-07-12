import { Router, Request, Response } from 'express';
import updateFundingSourceService from '#services/fundingSource/updateFundingSource.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/fundingSource/{clientId}/{fundingSourceId}:
 *   put:
 *     operationId: v1UpdateFundingSource
 *     summary: Update an existing funding source
 *     description: fundingSourceId is taken from the path — ignored if present in the request body.
 *     tags:
 *       - FundingSource
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fundingSourceId
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
 *       200:
 *         description: Funding source updated
 *       404:
 *         description: Client or funding source not found
 */
router.put('/:clientId/:fundingSourceId', async (req: Request, res: Response) => {
  const { clientId, fundingSourceId } = req.params as { clientId: string; fundingSourceId: string };
  const fundingSource = req.body;
  logger.info(`PUT /fundingSource/${clientId}/${fundingSourceId} — request`);

  await updateFundingSourceService(clientId, { ...fundingSource, fundingSourceId });

  logger.info(`PUT /fundingSource/${clientId}/${fundingSourceId} — response 200`);
  return res.status(200).json({ message: 'Funding source updated' });
});

export default router;
