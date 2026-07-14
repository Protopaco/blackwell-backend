import { Router, Request, Response } from 'express';
import deleteSupervisorService from '#services/supervisor/deleteSupervisor.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/supervisor/{clientId}/{supervisorId}:
 *   delete:
 *     operationId: v1DeleteSupervisor
 *     summary: Delete a supervisor
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
 *     responses:
 *       200:
 *         description: Supervisor deleted
 *       404:
 *         description: Client or supervisor not found
 */
router.delete('/:clientId/:supervisorId', async (req: Request, res: Response) => {
  const { clientId, supervisorId } = req.params as { clientId: string; supervisorId: string };
  logger.info(`DELETE /supervisor/${clientId}/${supervisorId} — request`);

  await deleteSupervisorService(clientId, supervisorId);

  logger.info(`DELETE /supervisor/${clientId}/${supervisorId} — response 200`);
  return res.status(200).json({ message: 'Supervisor deleted' });
});

export default router;
