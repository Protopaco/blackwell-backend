import { Router, Request, Response } from 'express';
import deleteHolidayService from '#services/holiday/deleteHoliday.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/holiday/{clientId}/{holidayId}:
 *   delete:
 *     operationId: v1DeleteHoliday
 *     summary: Delete a holiday
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
 *     responses:
 *       200:
 *         description: Holiday deleted
 *       404:
 *         description: Client or holiday not found
 */
router.delete('/:clientId/:holidayId', async (req: Request, res: Response) => {
  const { clientId, holidayId } = req.params as { clientId: string; holidayId: string };
  logger.info(`DELETE /holiday/${clientId}/${holidayId} — request`);

  await deleteHolidayService(clientId, holidayId);

  logger.info(`DELETE /holiday/${clientId}/${holidayId} — response 200`);
  return res.status(200).json({ message: 'Holiday deleted' });
});

export default router;
