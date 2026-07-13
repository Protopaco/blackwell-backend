import { Router, Request, Response } from 'express';
import createClientService from '#services/client/createClient.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/client:
 *   post:
 *     operationId: v1CreateClient
 *     summary: Create a new client
 *     description: >
 *       Provisions the full Drive/Sheets infrastructure for a new client (folders, PayrollConfig
 *       workbook, PayPeriodRegistry workbook) then appends the Clients row. clientId, status,
 *       and all folder/file ID fields are server-generated or server-resolved — ignored if present
 *       in the request body. Unlike other create endpoints, this returns the full created Client
 *       since the caller has no other way to retrieve the generated folder/file IDs.
 *     tags:
 *       - Client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientCreateRequest'
 *     responses:
 *       201:
 *         description: Client created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       404:
 *         description: A supplied existing-folder link does not resolve or is inaccessible
 *       422:
 *         description: A create-new step found an unexpected name collision, or the request is malformed
 */
router.post('/', async (req: Request, res: Response) => {
  logger.info('POST /client — request');

  const client = await createClientService(req.body);

  logger.info(`POST /client — response 201 clientId=${client.clientId}`);
  return res.status(201).json(client);
});

export default router;
