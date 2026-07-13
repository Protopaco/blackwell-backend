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
 *     description: employeeId is server-generated — ignored if present in the request body. If timesheetFileId is omitted, a new timesheet workbook is provisioned automatically and its ID is saved.
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
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       201:
 *         description: Employee created
 *       404:
 *         description: Client not found
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
