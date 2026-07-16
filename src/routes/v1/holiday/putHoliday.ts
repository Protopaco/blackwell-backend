import { Router, Request, Response } from 'express';
import updateHolidayService from '#services/holiday/updateHoliday.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/holiday/{clientId}/{holidayId}:
 *   put:
 *     operationId: v1UpdateHoliday
 *     summary: Update an existing holiday
 *     description: holidayId is taken from the path — ignored if present in the request body.
 *     tags:
 *       - Holiday
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: holidayId
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
 *       200:
 *         description: Holiday updated
 *       404:
 *         description: Client or holiday not found
 *       422:
 *         description: holidayDate is not a valid YYYY-MM-DD date
 */
router.put('/:clientId/:holidayId', async (req: Request, res: Response) => {
  const { clientId, holidayId } = req.params as { clientId: string; holidayId: string };
  const holiday = req.body;
  logger.info(`PUT /holiday/${clientId}/${holidayId} — request`);

  await updateHolidayService(clientId, { ...holiday, holidayId });

  logger.info(`PUT /holiday/${clientId}/${holidayId} — response 200`);
  return res.status(200).json({ message: 'Holiday updated' });
});

export default router;
