import { Router, Request, Response } from 'express';
import generateAllocationReportService from '#services/payrollReport/generateAllocationReport.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payrollReport/{clientId}/{payPeriodId}/allocation-report:
 *   post:
 *     operationId: v1GenerateAllocationReport
 *     summary: Generate or regenerate the allocation report for a pay period
 *     description: Reads current_hours, EmployeeExpenses, and AdditionalExpenses to calculate funding source allocations. Overwrites the AllocationReport tab and returns the results.
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
 *         description: Allocation report generated successfully. Returns one row per funding source.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AllocationReportRow'
 *       404:
 *         description: Client or pay period not found
 *       422:
 *         description: Payroll report not yet generated, or no hours data found
 */
router.post('/:clientId/:payPeriodId/allocation-report', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  logger.info(`POST /payrollReport/${clientId}/${payPeriodId}/allocation-report — request`);

  const rows = await generateAllocationReportService(clientId, payPeriodId);

  logger.info(`POST /payrollReport/${clientId}/${payPeriodId}/allocation-report — response 200 count=${rows.length}`);
  return res.status(200).json(rows);
});

export default router;
