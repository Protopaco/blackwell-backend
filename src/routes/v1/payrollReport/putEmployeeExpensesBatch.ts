import { Router, Request, Response } from 'express';
import updateEmployeeExpensesBatchService from '#services/payrollReport/updateEmployeeExpensesBatch.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payrollReport/{clientId}/{payPeriodId}/employeeExpenses/batch:
 *   put:
 *     operationId: v1UpdateEmployeeExpensesBatch
 *     summary: Update totalExpense for multiple employees in a pay period at once
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
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/EmployeeExpenseUpdate'
 *     responses:
 *       200:
 *         description: Employee expenses updated
 *       404:
 *         description: Client, pay period, or payroll report not found
 */
router.put('/:clientId/:payPeriodId/employeeExpenses/batch', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  const updates = req.body;
  logger.info(`PUT /payrollReport/${clientId}/${payPeriodId}/employeeExpenses/batch — request count=${updates.length}`);

  await updateEmployeeExpensesBatchService(clientId, payPeriodId, updates);

  logger.info(`PUT /payrollReport/${clientId}/${payPeriodId}/employeeExpenses/batch — response 200`);
  return res.status(200).json({ message: 'Employee expenses updated' });
});

export default router;
