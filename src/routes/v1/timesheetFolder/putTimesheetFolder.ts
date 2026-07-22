import { Router, Request, Response } from 'express';
import updateTimesheetFolderService from '#services/timesheetFolder/updateTimesheetFolder.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/timesheetFolder/{clientId}/{timesheetFolderId}:
 *   put:
 *     operationId: v1UpdateTimesheetFolder
 *     summary: Update a timesheet folder
 *     description: >
 *       All body fields are optional; only what's provided is changed. The Drive folder link/id is
 *       immutable after creation.
 *     tags:
 *       - TimesheetFolder
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: timesheetFolderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TimesheetFolderUpdateRequest'
 *     responses:
 *       200:
 *         description: TimesheetFolder updated
 *       404:
 *         description: Client or timesheet folder not found
 *       422:
 *         description: Duplicate timesheet folder name, or driveFolderLink was supplied on update
 */
router.put('/:clientId/:timesheetFolderId', async (req: Request, res: Response) => {
  const { clientId, timesheetFolderId } = req.params as { clientId: string; timesheetFolderId: string };
  logger.info(`PUT /timesheetFolder/${clientId}/${timesheetFolderId} — request`);

  await updateTimesheetFolderService(clientId, timesheetFolderId, req.body);

  logger.info(`PUT /timesheetFolder/${clientId}/${timesheetFolderId} — response 200`);
  return res.status(200).json({ message: 'TimesheetFolder updated' });
});

export default router;
