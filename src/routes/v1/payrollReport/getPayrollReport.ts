import { Router, Request, Response } from 'express';
import getPayrollReportService from '#services/payrollReport/getPayrollReport.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payrollReport/{clientId}/{payPeriodId}:
 *   get:
 *     operationId: v1GetPayrollReport
 *     summary: Get the current payroll summary for a pay period grouped by employee
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
 *         description: Payroll report grouped by employee, with hourly and flat rate entries separated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   employeeName:
 *                     type: string
 *                   hourly:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         payrollCategory:
 *                           type: string
 *                           enum: [Regular, ETO, PTO, STO]
 *                         payRate:
 *                           type: string
 *                           enum: [Base, Secondary]
 *                         isHoliday:
 *                           type: boolean
 *                         totalHours:
 *                           type: number
 *                   flatRate:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         payRate:
 *                           type: string
 *                           enum: [FlatRate1, FlatRate2]
 *                         quantity:
 *                           type: number
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
