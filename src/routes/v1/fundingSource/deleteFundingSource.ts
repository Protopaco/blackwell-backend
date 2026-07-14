import { Router, Request, Response } from 'express';
import deleteFundingSourceService from '#services/fundingSource/deleteFundingSource.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/fundingSource/{clientId}/{fundingSourceId}:
 *   delete:
 *     operationId: v1DeleteFundingSource
 *     summary: Delete a funding source
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
 *     responses:
 *       200:
 *         description: Funding source deleted
 *       404:
 *         description: Client or funding source not found
 *       422:
 *         description: Funding source is still referenced by one or more activities
 */
router.delete('/:clientId/:fundingSourceId', async (req: Request, res: Response) => {
  const { clientId, fundingSourceId } = req.params as { clientId: string; fundingSourceId: string };
  logger.info(`DELETE /fundingSource/${clientId}/${fundingSourceId} — request`);

  await deleteFundingSourceService(clientId, fundingSourceId);

  logger.info(`DELETE /fundingSource/${clientId}/${fundingSourceId} — response 200`);
  return res.status(200).json({ message: 'Funding source deleted' });
});

export default router;
