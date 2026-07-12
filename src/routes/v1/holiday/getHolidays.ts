import { Router, Request, Response } from 'express';
import getHolidaysService from '#services/holiday/getHolidays.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/holiday/{clientId}:
 *   get:
 *     operationId: v1GetHolidays
 *     summary: Get all holidays for a client
 *     tags:
 *       - Holiday
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of holidays
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Holiday'
 *       404:
 *         description: Client not found
 */
router.get('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  logger.info(`GET /holiday/${clientId} — request`);

  const holidays = await getHolidaysService(clientId);

  logger.info(`GET /holiday/${clientId} — response 200 count=${holidays.length}`);
  return res.status(200).json(holidays);
});

export default router;
