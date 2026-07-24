import { Router, Request, Response } from 'express';
import removeEmployeeFromPayPeriodService from '#services/payPeriod/removeEmployeeFromPayPeriod.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payPeriod/{clientId}/{payPeriodId}/employee/{employeeId}:
 *   delete:
 *     operationId: v1RemoveEmployeeFromPayPeriod
 *     summary: Remove an employee from a pay period
 *     description: >
 *       Soft-removes the employee from this pay period's snapshot (flips their snapshot row to Inactive
 *       — no hard delete). Blocked once a timesheet has already been generated for that employee this
 *       pay period; use the includeInPayroll checkbox on their timesheet instead.
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
 *       200:
 *         description: Employee removed from pay period
 *       404:
 *         description: Client, pay period, or employee not found on this pay period
 *       422:
 *         description: A timesheet has already been generated for this employee this pay period
 */
router.delete('/:clientId/:payPeriodId/employee/:employeeId', async (req: Request, res: Response) => {
  const { clientId, payPeriodId, employeeId } = req.params as { clientId: string; payPeriodId: string; employeeId: string };
  logger.info(`DELETE /payPeriod/${clientId}/${payPeriodId}/employee/${employeeId} — request`);

  await removeEmployeeFromPayPeriodService(clientId, payPeriodId, employeeId);

  logger.info(`DELETE /payPeriod/${clientId}/${payPeriodId}/employee/${employeeId} — response 200`);
  return res.status(200).json({ message: 'Employee removed from pay period' });
});

export default router;
