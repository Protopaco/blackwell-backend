import { Router, Request, Response } from 'express';
import createEmployeeService from '#services/employee/createEmployee.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/employee/{clientId}:
 *   post:
 *     operationId: v1CreateEmployee
 *     summary: Create a new employee
 *     description: >
 *       employeeId is server-generated — ignored if present in the request body. Exactly one of
 *       timesheetFileId (existing file, used as-is) or timesheetFolderId (must be an Active
 *       TimesheetFolder configured for this client — a new timesheet workbook is provisioned there)
 *       must be provided.
 *     tags:
 *       - Employee
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
 *             $ref: '#/components/schemas/EmployeeCreateRequest'
 *     responses:
 *       201:
 *         description: Employee created
 *       404:
 *         description: Client not found, or timesheetFolderId doesn't match an Active TimesheetFolder
 *       422:
 *         description: Neither timesheetFileId nor timesheetFolderId was provided
 */
router.post('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  const employee = req.body;
  logger.info(`POST /employee/${clientId} — request`);

  await createEmployeeService(clientId, employee);

  logger.info(`POST /employee/${clientId} — response 201`);
  return res.status(201).json({ message: 'Employee created' });
});

export default router;
