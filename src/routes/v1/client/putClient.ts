import { Router, Request, Response } from 'express';
import updateClientService from '#services/client/updateClient.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/client/{clientId}:
 *   put:
 *     operationId: v1UpdateClient
 *     summary: Update a client
 *     description: >
 *       Only status, clientName, and clientCode are editable — all other fields (folder/file IDs)
 *       are set once at creation. All body fields are optional; only what's provided is changed.
 *     tags:
 *       - Client
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
 *             $ref: '#/components/schemas/ClientUpdateRequest'
 *     responses:
 *       200:
 *         description: Client updated
 *       404:
 *         description: Client not found
 */
router.put('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  logger.info(`PUT /client/${clientId} — request`);

  await updateClientService(clientId, req.body);

  logger.info(`PUT /client/${clientId} — response 200`);
  return res.status(200).json({ message: 'Client updated' });
});

export default router;
