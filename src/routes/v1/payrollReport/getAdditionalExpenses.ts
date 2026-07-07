import { Router, Request, Response } from 'express';
import getAdditionalExpensesService from '#services/payrollReport/getAdditionalExpenses.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payrollReport/{clientId}/{payPeriodId}/additional-expenses:
 *   get:
 *     operationId: v1GetAdditionalExpenses
 *     summary: Get additional expense records for a pay period
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
 *         description: List of additional expense records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdditionalExpense'
 *       404:
 *         description: Client or pay period not found
 */
router.get('/:clientId/:payPeriodId/additional-expenses', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  logger.info(`GET /payrollReport/${clientId}/${payPeriodId}/additional-expenses — request`);

  const expenses = await getAdditionalExpensesService(clientId, payPeriodId);

  logger.info(`GET /payrollReport/${clientId}/${payPeriodId}/additional-expenses — response 200 count=${expenses.length}`);
  return res.status(200).json(expenses);
});

export default router;
