import { Router, Request, Response } from 'express';
import updateEmployeeExpensesService from '#services/payrollReport/updateEmployeeExpenses.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payrollReport/{clientId}/{payPeriodId}/employeeExpenses:
 *   put:
 *     operationId: v1UpdateEmployeeExpenses
 *     summary: Update a single employee expense record for a pay period
 *     tags:
 *       - PayrollReport
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeExpense'
 *     responses:
 *       200:
 *         description: Employee expense updated
 *       404:
 *         description: Client, pay period, or payroll report not found
 */
router.put('/:clientId/:payPeriodId/employeeExpenses', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  const expense = req.body;
  logger.info(`PUT /payrollReport/${clientId}/${payPeriodId}/employeeExpenses — request employeeId=${expense.employeeId}`);

  await updateEmployeeExpensesService(clientId, payPeriodId, expense);

  logger.info(`PUT /payrollReport/${clientId}/${payPeriodId}/employeeExpenses — response 200`);
  return res.status(200).json({ message: 'Employee expense updated' });
});

export default router;
