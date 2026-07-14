import { Router, Request, Response } from 'express';
import updateEmployeeService from '#services/employee/updateEmployee.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/employee/{clientId}/{employeeId}:
 *   put:
 *     operationId: v1UpdateEmployee
 *     summary: Update an existing employee
 *     description: employeeId is taken from the path — ignored if present in the request body. timesheetFileId can be changed here (e.g. to correct a mistake).
 *     tags:
 *       - Employee
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: employeeId
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
 *       200:
 *         description: Employee updated
 *       404:
 *         description: Client or employee not found
 */
router.put('/:clientId/:employeeId', async (req: Request, res: Response) => {
  const { clientId, employeeId } = req.params as { clientId: string; employeeId: string };
  const employee = req.body;
  logger.info(`PUT /employee/${clientId}/${employeeId} — request`);

  await updateEmployeeService(clientId, { ...employee, employeeId });

  logger.info(`PUT /employee/${clientId}/${employeeId} — response 200`);
  return res.status(200).json({ message: 'Employee updated' });
});

export default router;
