import { Router, Request, Response } from 'express';
import createSupervisorService from '#services/supervisor/createSupervisor.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/supervisor/{clientId}:
 *   post:
 *     operationId: v1CreateSupervisor
 *     summary: Create a new supervisor
 *     description: supervisorId is server-generated — ignored if present in the request body.
 *     tags:
 *       - Supervisor
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
 *             $ref: '#/components/schemas/Supervisor'
 *     responses:
 *       201:
 *         description: Supervisor created
 *       404:
 *         description: Client not found
 */
router.post('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  const supervisor = req.body;
  logger.info(`POST /supervisor/${clientId} — request`);

  await createSupervisorService(clientId, supervisor);

  logger.info(`POST /supervisor/${clientId} — response 201`);
  return res.status(201).json({ message: 'Supervisor created' });
});

export default router;
