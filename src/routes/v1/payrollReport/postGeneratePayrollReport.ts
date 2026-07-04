import { Router, Request, Response } from 'express';
import generatePayrollReportService from '#services/payrollReport/generatePayrollReport.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payrollReport/{clientId}/{payPeriodId}/generate:
 *   post:
 *     operationId: v1GeneratePayrollReport
 *     summary: Generate or regenerate the payroll report for a pay period
 *     description: Only processes timesheets that are Complete (both employee and supervisor signed). Archives the previous report tabs and writes fresh data.
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
 *         description: Payroll report generated successfully
 *       404:
 *         description: Client or pay period not found
 *       422:
 *         description: No Complete timesheets found
 */
router.post('/:clientId/:payPeriodId/generate', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  logger.info(`POST /payrollReport/${clientId}/${payPeriodId}/generate`);

  await generatePayrollReportService(clientId, payPeriodId);

  logger.info(`POST /payrollReport — response 200`);
  return res.status(200).json({ message: 'Payroll report generated' });
});

export default router;
