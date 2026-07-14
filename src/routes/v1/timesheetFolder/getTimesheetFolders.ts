import { Router, Request, Response } from 'express';
import getTimesheetFoldersService from '#services/timesheetFolder/getTimesheetFolders.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/timesheetFolder/{clientId}:
 *   get:
 *     operationId: v1GetTimesheetFolders
 *     summary: Get all timesheet folders for a client
 *     tags:
 *       - TimesheetFolder
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of timesheet folders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TimesheetFolder'
 *       404:
 *         description: Client not found
 */
router.get('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  logger.info(`GET /timesheetFolder/${clientId} — request`);

  const timesheetFolders = await getTimesheetFoldersService(clientId);

  logger.info(`GET /timesheetFolder/${clientId} — response 200 count=${timesheetFolders.length}`);
  return res.status(200).json(timesheetFolders);
});

export default router;
