import { Router, Request, Response } from 'express';
import getSupervisorsService from '#services/supervisor/getSupervisors.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/supervisor/{clientId}:
 *   get:
 *     operationId: v1GetSupervisors
 *     summary: Get all supervisors for a client
 *     tags:
 *       - Supervisor
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of supervisors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Supervisor'
 *       404:
 *         description: Client not found
 */
router.get('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  logger.info(`GET /supervisor/${clientId} — request`);

  const supervisors = await getSupervisorsService(clientId);

  logger.info(`GET /supervisor/${clientId} — response 200 count=${supervisors.length}`);
  return res.status(200).json(supervisors);
});

export default router;
