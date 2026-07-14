import { Router, Request, Response } from 'express';
import updateSupervisorService from '#services/supervisor/updateSupervisor.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/supervisor/{clientId}/{supervisorId}:
 *   put:
 *     operationId: v1UpdateSupervisor
 *     summary: Update an existing supervisor
 *     description: supervisorId is taken from the path — ignored if present in the request body.
 *     tags:
 *       - Supervisor
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: supervisorId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supervisor'
 *     responses:
 *       200:
 *         description: Supervisor updated
 *       404:
 *         description: Client or supervisor not found
 */
router.put('/:clientId/:supervisorId', async (req: Request, res: Response) => {
  const { clientId, supervisorId } = req.params as { clientId: string; supervisorId: string };
  const supervisor = req.body;
  logger.info(`PUT /supervisor/${clientId}/${supervisorId} — request`);

  await updateSupervisorService(clientId, { ...supervisor, supervisorId });

  logger.info(`PUT /supervisor/${clientId}/${supervisorId} — response 200`);
  return res.status(200).json({ message: 'Supervisor updated' });
});

export default router;
