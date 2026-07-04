import { Router, Request, Response } from 'express';
import updateEmployeeExpensesService from '#services/payrollReport/updateEmployeeExpenses.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payrollReport/{clientId}/{payPeriodId}/employee-expenses:
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
 *       422:
 *         description: Employee has hours this pay period and cannot be marked inactive
 */
router.put('/:clientId/:payPeriodId/employee-expenses', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  const expense = req.body;
  logger.info(`PUT /payrollReport/${clientId}/${payPeriodId}/employee-expenses — request employeeId=${expense.employeeId}`);

  try {
    await updateEmployeeExpensesService(clientId, payPeriodId, expense);
  } catch (error: any) {
    if (error?.message?.startsWith('Client not found') || error?.message?.startsWith('Pay period not found') || error?.message?.startsWith('No payroll report file exists')) {
      logger.info(`PUT /payrollReport/${clientId}/${payPeriodId}/employee-expenses — response 404: ${error.message}`);
      return res.status(404).json({ error: 'not_found', message: error.message });
    }
    if (error?.message?.includes('has hours this pay period')) {
      logger.info(`PUT /payrollReport/${clientId}/${payPeriodId}/employee-expenses — response 422: ${error.message}`);
      return res.status(422).json({ error: 'has_hours', message: error.message });
    }
    throw error;
  }

  logger.info(`PUT /payrollReport/${clientId}/${payPeriodId}/employee-expenses — response 200`);
  return res.status(200).json({ message: 'Employee expense updated' });
});

export default router;
