import { Router, Request, Response } from 'express';
import getPayrollReportService from '#services/payrollReport/getPayrollReport.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payrollReport/{clientId}/{payPeriodId}:
 *   get:
 *     operationId: v1GetPayrollReport
 *     summary: Get the current ADP Summary data for a pay period
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
 *         description: Payroll report summary
 *       404:
 *         description: Client, pay period, or report not found
 */
router.get('/:clientId/:payPeriodId', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  logger.info(`GET /payrollReport/${clientId}/${payPeriodId}`);

  const report = await getPayrollReportService(clientId, payPeriodId);
  if (!report) {
    logger.info(`GET /payrollReport — response 404`);
    return res.status(404).json({ error: 'not_found', message: 'Payroll report not found' });
  }

  logger.info(`GET /payrollReport — response 200`);
  return res.status(200).json(report);
});

export default router;
