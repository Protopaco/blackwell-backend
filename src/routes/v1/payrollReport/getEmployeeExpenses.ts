import { Router, Request, Response } from 'express';
import getEmployeeExpensesService from '#services/payrollReport/getEmployeeExpenses.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payrollReport/{clientId}/{payPeriodId}/employee-expenses:
 *   get:
 *     operationId: v1GetEmployeeExpenses
 *     summary: Get employee expense records for a pay period
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
 *     responses:
 *       200:
 *         description: List of employee expense records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EmployeeExpense'
 *       404:
 *         description: Client or pay period not found
 */
router.get('/:clientId/:payPeriodId/employee-expenses', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  logger.info(`GET /payrollReport/${clientId}/${payPeriodId}/employee-expenses — request`);

  const expenses = await getEmployeeExpensesService(clientId, payPeriodId);

  logger.info(`GET /payrollReport/${clientId}/${payPeriodId}/employee-expenses — response 200 count=${expenses.length}`);
  return res.status(200).json(expenses);
});

export default router;
