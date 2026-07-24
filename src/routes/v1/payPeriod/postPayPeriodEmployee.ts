import { Router, Request, Response } from 'express';
import addEmployeeToPayPeriodService from '#services/payPeriod/addEmployeeToPayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{clientId}/{payPeriodId}/employee/{employeeId}:
 *   post:
 *     operationId: v1AddEmployeeToPayPeriod
 *     summary: Add an employee to a pay period
 *     description: >
 *       Copies the employee's current row from the client's PayrollConfig into this pay period's report
 *       workbook snapshot. The employee must exist and be Active in PayrollConfig. If the employee was
 *       previously removed from this pay period, their snapshot row is refreshed and reactivated.
 *     tags:
 *       - PayPeriod
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: payPeriodId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Employee added to pay period
 *       404:
 *         description: Client, pay period, or employee not found
 *       422:
 *         description: Employee is not Active in PayrollConfig, or is already on this pay period
 */
router.post('/:clientId/:payPeriodId/employee/:employeeId', async (req: Request, res: Response) => {
  const { clientId, payPeriodId, employeeId } = req.params as { clientId: string; payPeriodId: string; employeeId: string };
  logger.info(`POST /payPeriod/${clientId}/${payPeriodId}/employee/${employeeId} — request`);

  await addEmployeeToPayPeriodService(clientId, payPeriodId, employeeId);

  logger.info(`POST /payPeriod/${clientId}/${payPeriodId}/employee/${employeeId} — response 201`);
  return res.status(201).json({ message: 'Employee added to pay period' });
});

export default router;
