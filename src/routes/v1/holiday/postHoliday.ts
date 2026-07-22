import { Router, Request, Response } from 'express';
import createHolidayService from '#services/holiday/createHoliday.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/holiday/{clientId}:
 *   post:
 *     operationId: v1CreateHoliday
 *     summary: Create a new holiday
 *     description: holidayId is server-generated — ignored if present in the request body.
 *     tags:
 *       - Holiday
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
 *             $ref: '#/components/schemas/Holiday'
 *     responses:
 *       201:
 *         description: Holiday created
 *       404:
 *         description: Client not found
 *       422:
 *         description: holidayDate is not a valid YYYY-MM-DD date
 */
router.post('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  const holiday = req.body;
  logger.info(`POST /holiday/${clientId} — request`);

  await createHolidayService(clientId, holiday);

  logger.info(`POST /holiday/${clientId} — response 201`);
  return res.status(201).json({ message: 'Holiday created' });
});

export default router;
