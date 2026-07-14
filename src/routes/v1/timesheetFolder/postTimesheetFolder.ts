import { Router, Request, Response } from 'express';
import createTimesheetFolderService from '#services/timesheetFolder/createTimesheetFolder.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/timesheetFolder/{clientId}:
 *   post:
 *     operationId: v1CreateTimesheetFolder
 *     summary: Create a new timesheet folder
 *     description: >
 *       timesheetFolderId is server-generated, status is always created Active — both ignored if
 *       present in the request body. driveFolderLink is parsed and verified against Drive before
 *       being stored.
 *     tags:
 *       - TimesheetFolder
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
 *             $ref: '#/components/schemas/TimesheetFolderCreateRequest'
 *     responses:
 *       201:
 *         description: TimesheetFolder created
 *       404:
 *         description: Client not found, or the supplied driveFolderLink doesn't resolve/is inaccessible
 */
router.post('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  logger.info(`POST /timesheetFolder/${clientId} — request`);

  await createTimesheetFolderService(clientId, req.body);

  logger.info(`POST /timesheetFolder/${clientId} — response 201`);
  return res.status(201).json({ message: 'TimesheetFolder created' });
});

export default router;
