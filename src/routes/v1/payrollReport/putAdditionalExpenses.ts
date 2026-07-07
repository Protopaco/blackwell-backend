import { Router, Request, Response } from 'express';
import updateAdditionalExpensesService from '#services/payrollReport/updateAdditionalExpenses.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payrollReport/{clientId}/{payPeriodId}/additional-expenses:
 *   put:
 *     operationId: v1UpdateAdditionalExpenses
 *     summary: Save additional expense records for a pay period
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
 *               $ref: '#/components/schemas/AdditionalExpense'
 *     responses:
 *       200:
 *         description: Additional expenses saved
 *       404:
 *         description: Client, pay period, or payroll report not found
 */
router.put('/:clientId/:payPeriodId/additional-expenses', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  const expenses = req.body;
  logger.info(`PUT /payrollReport/${clientId}/${payPeriodId}/additional-expenses — request count=${expenses.length}`);

  await updateAdditionalExpensesService(clientId, payPeriodId, expenses);

  logger.info(`PUT /payrollReport/${clientId}/${payPeriodId}/additional-expenses — response 200`);
  return res.status(200).json({ message: 'Additional expenses saved' });
});

export default router;
