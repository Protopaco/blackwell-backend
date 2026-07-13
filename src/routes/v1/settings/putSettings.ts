import { Router, Request, Response } from 'express';
import updateSettingsService from '#services/settings/updateSettings.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/settings/{clientId}:
 *   put:
 *     operationId: v1UpdateSettings
 *     summary: Update settings for a client
 *     tags:
 *       - Settings
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
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: Settings updated
 *       404:
 *         description: Client not found
 */
router.put('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  const settings = req.body;
  logger.info(`PUT /settings/${clientId} — request`);

  await updateSettingsService(clientId, settings);

  logger.info(`PUT /settings/${clientId} — response 200`);
  return res.status(200).json({ message: 'Settings updated' });
});

export default router;
