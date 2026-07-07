import { Router, Request, Response } from 'express';
import getClientsService from '#services/client/getClients.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/client:
 *   get:
 *     operationId: v1GetClients
 *     summary: Get all clients
 *     tags:
 *       - Client
 *     responses:
 *       200:
 *         description: List of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 */
router.get('/', async (req: Request, res: Response) => {
  logger.info('GET /client — request');
  const clients = await getClientsService();
  logger.info(`GET /client — response 200 count=${clients.length}`);
  res.status(200).json(clients);
});

export default router;
