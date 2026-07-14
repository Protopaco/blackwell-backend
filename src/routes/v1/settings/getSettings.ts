import { Router, Request, Response } from 'express';
import getSettingsService from '#services/settings/getSettings.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/settings/{clientId}:
 *   get:
 *     operationId: v1GetSettings
 *     summary: Get settings for a client
 *     tags:
 *       - Settings
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 *       404:
 *         description: Client not found
 */
router.get('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  logger.info(`GET /settings/${clientId} — request`);

  const settings = await getSettingsService(clientId);

  logger.info(`GET /settings/${clientId} — response 200`);
  return res.status(200).json(settings);
});

export default router;
